// ==UserScript==
// @name         kbin Look and Feel
// @namespace    https://github.com/joeferner/kbin-reddit
// @version      0.1
// @description  Give kbin more condensed look and feel
// @author       Joe Ferner
// @match        https://kbin.social/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=greasyfork.org
// @grant        GM_addStyle
// ==/UserScript==

function updateCss() {
  let commentsCss = '';
  for (let level = 2, i = 1; level < 10; level++, i++) {
    commentsCss += `
         .comments-tree .comment-line--${level} {
           left: ${i * 2}rem !important;
         }
         .comments-tree div.comment-level--${level} {
           margin: 0 !important;
           padding-left: ${i * 2}rem !important;
         }
      `;
  }

  for (let level = 1; level < 10; level++) {
    commentsCss += `
         .comments-tree .comment-line--${level} {
           cursor: pointer;
           width: 5px;
         }

         .comments-tree .comment-line--${level}:hover {
           border-width: 3px;
         }
       `;
  }

  GM_addStyle(`
    #content article.entry, #content article.entry.no-image {
      padding: 5px;
      margin: 0;
      grid-template-areas: "vote image title " "vote image meta " "vote image footer " "vote image body" !important;
      grid-template-columns: min-content 75px auto;
    }

    #content article.entry figure {
      margin: 0 5px 0 0;
    }

    #content article.entry.no-image figure {
      display: flex;
      align-items: center;
      justify-content: center;
    }

    #content article.entry.no-image figure i {
      font-size: 53px;
      color: #bbb;
    }

    #content article.entry figure img {
      max-width: 70px;
      max-height: 52px;
    }

    #content article.entry .content {
      display: none;
    }

    #content article.entry header {
      margin-bottom: 0;
    }

    #content article.entry header h2 {
      display: flex;
      align-items: center;
    }

    #content article.entry .meta {
      color: #888;
      font-size: 10px;
    }

    #content article.entry header h2 > a {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: 750px;
      margin-right: 5px;
      padding-bottom: 3px;
      display: block;
      font-size: 16px;
    }

    .section menu > li {
      padding: 0;
    }

    .vote {
      gap: 0;
    }

    .vote button {
      height: 22px;
    }

    .preview {
      margin: 5px;
    }

    .pagination {
      margin: 0;
      padding: 0 0 0 5px;
      gap: 0;
      justify-content: left;
    }

    .pagination__item, .pagination__item--disabled {
      display: none;
    }

    .pagination__item--previous-page, .pagination__item--next-page {
      display: unset;
    }

    .pagination a.pagination__item, .pagination span.pagination__item {
      padding: 1px 4px;
      font-weight: bold;
    }

    #sidebar .entries, #sidebar .posts {
      display: none;
    }

    .comment {
      grid-template-areas: "vote avatar header header" "vote avatar body body" "vote avatar meta meta" "vote avatar footer footer";
      grid-template-columns: min-content min-content auto;
      grid-gap: 3px;
    }

    .comment .vote {
      flex-direction: column;
      justify-content: flex-start;
    }

    .comment header {
      margin-bottom: 0;
    }

    .comment .content {
      padding-top: 0 !important;
      padding-bottom: 0 !important;
    }

    section.comments.comments-tree blockquote {
      margin-left: 0 !important;
    }

    .comments-tree .comment-margin {
      border: 0 !important;
    }

    .comments-tree .comment-level--1 {
      border-left: 1px solid #b9ab52;
    }

    .comments-tree .comment-line--1 {
      border-left: 1px dashed #b9ab52;
      bottom: 0;
      height: 100%;
      left: 0;
      opacity: .4;
      position: absolute;
      z-index: 1;
    }

    ${commentsCss}
  `);
}

function updatePosts() {
  // add title/tooltip to links, css is limiting there width
  for (let a of document.querySelectorAll('article.entry header h2 > a')) {
    a.title = a.innerText;
  }

  // add dummy images to no-image posts
  for (let figure of document.querySelectorAll('article.entry.no-image figure')) {
    if (figure.innerHTML.trim().length === 0) {
      figure.innerHTML = '<i class="fa-regular fa-newspaper" aria-label="Article"></i>';
    }
  }
}

function updatePagination() {
  // change next/previous page links to more text to provide larger click area
  for (let a of document.querySelectorAll('.pagination__item--next-page')) {
    a.innerText = 'next ›';
  }
  for (let a of document.querySelectorAll('.pagination__item--previous-page')) {
    a.innerText = '‹ prev';
  }
}

function updateComments() {
  function getCommentLevelOfElement(elem) {
    return Number(elem.getAttribute("class").match(/comment-level--(\d+)/)[1]);
  }

  // add level 1 line
  for (let section of document.querySelectorAll('section.comments')) {
    const level1Line = document.createElement('div');
    level1Line.setAttribute("class", "comment-line--1");
    section.appendChild(level1Line);
  }

  const commentTree = { children: [] };
  function findTreeItem(elem, parent) {
    parent = parent || commentTree;
    for (let child of parent.children) {
      if (child.div === elem) {
        return child;
      }
      const found = findTreeItem(elem, child);
      if (found) {
        return found;
      }
    }
    return undefined;
  }

  // add collapsible comments
  const stack = [commentTree];
  let lastLevel = 1;
  for (let comment of document.querySelectorAll('.comment')) {
    // wrap comments in div to allow clicking in margin
    const div = document.createElement('div');
    const level = getCommentLevelOfElement(comment);
    div.setAttribute("class", `comment-level--${level} comment-margin`);
    comment.replaceWith(div);
    div.appendChild(comment);

    if (level > lastLevel) {
      const children = stack[stack.length - 1].children;
      stack.push(children[children.length - 1]);
    } else if (level < lastLevel) {
      stack.length = level;
    }

    const item = {
      level,
      parent: stack[stack.length - 1],
      div,
      children: []
    };
    stack[stack.length - 1].children.push(item);

    lastLevel = level;
  }

  for (let level = 1; level < 10; level++) {
    for (let commentLine of document.querySelectorAll(`.comment-line--${level}`)) {
      commentLine.addEventListener('click', (event) => {
        const marginElem = document.elementsFromPoint(event.x, event.y).filter(elem => (elem.getAttribute('class') || '').includes('comment-margin'))[0];
        if (marginElem) {
          const treeItem = findTreeItem(marginElem);
          console.log(event, treeItem);
        }
      });
    }
  }

  console.log(commentTree);
}

(function () {
  'use strict';

  updateCss();
  updatePosts();
  updatePagination();
  updateComments();
})();

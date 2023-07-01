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

function getCommentLevelOfElement(elem) {
  return Number(elem.getAttribute("class").match(/comment-level--(\d+)/)[1]);
}

function findParentComment(elem) {
    const elemLevel = getCommentLevelOfElement(elem);
    let sib = elem;
    while (true) {
      sib = sib.previousSibling;
      if (!sib) {
        return undefined;
      }
      console.log(sib.tagName);
      if (sib.tagName !== 'DIV') {
        continue;
      }
      const sibLevel = getCommentLevelOfElement(sib);
      if (sibLevel < elemLevel) {
        return sib;
      }
    }
    return undefined;
}

(function() {
  'use strict';

   let commentsCss = '';
   for(let level = 2, i = 1; level < 10; level++, i++) {
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

  GM_addStyle(`
    article.entry, article.entry.no-image {
      padding: 5px;
      margin: 0;
      grid-template-areas: "vote image title " "vote image meta " "vote image footer " "vote image body" !important;
      grid-template-columns: min-content 75px auto;
    }

    article.entry figure {
      margin: 0 5px 0 0;
    }

    article.entry figure img {
      max-width: 70px;
      max-height: 52px;
    }

    article.entry .content {
      display: none;
    }

    article.entry header {
      margin-bottom: 0;
    }

    article.entry header h2 {
      display: flex;
      align-items: center;
    }

    article.entry .meta {
      color: #888;
      font-size: 10px;
    }

    article.entry header h2 > a {
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

    ${commentsCss}
  `);

  for (let a of document.querySelectorAll('article.entry header h2 > a')) {
    a.title = a.innerText;
  }

  for (let a of document.querySelectorAll('.pagination__item--next-page')) {
    a.innerText = 'next ›';
  }
  for (let a of document.querySelectorAll('.pagination__item--previous-page')) {
    a.innerText = '‹ prev';
  }

  for (let comment of document.querySelectorAll('.comment')) {
    const div = document.createElement('div');
    const level = getCommentLevelOfElement(comment);
    div.setAttribute("class", `comment-level--${level} comment-margin`);
    comment.replaceWith(div);
    div.appendChild(comment);
    div.addEventListener('click', (event) => {
      if (event.target === div) {
        const parentComment = findParentComment(div);
        console.log(parentComment);
      }
    });
  }
})();

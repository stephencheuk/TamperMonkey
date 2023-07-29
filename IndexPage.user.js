// ==UserScript==
// @name         Index Page Beauity Kit
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Google it!
// @author       You
// @match        http://sacem-fd.gnslocal:8888/*
// @require      http://code.jquery.com/jquery-3.4.1.min.js
// ==/UserScript==

/* @require      file://D:/Development/TamperMonkey/IndexPage/index.js */

(function () {
  "use strict";

  var css = `
    body {
      background: #ebebeb !important;
    }
    * {
      font-family: Arial, sans-serif;
      font-size: 1rem; 
    }
    svg {
      width: 30px;
    }
    svg.ArrowForwardIcon{
      stroke: transparent !important;
      fill: #80808054;
    }
    .banner {
      text-align: center;
      position: relative;
      padding: 8px;
      justify-content: center;
      align-items: center;
      display: flex;
      gap: 8px;      
    }
    .banner button{
      position: absolute;
      padding: 4px 12px;
      left: 0;
      background-color: transparent !important;
      border: none !important;
      font-size: 1.2rem;
      cursor: pointer;
    }
    .banner button:hover{
      background-color: lightgray !important;
    }
    .banner a { text-decoration1: none !important; color: black !important; }
    .search {
      display: flex;
      height: 40px;
      gap: 4px;
      align-items: center;
    }
    #search {
      border: 1px solid black !important;
      height: 30px;
      padding: 0.5rem;
      outline: none;
      font-size: 1rem;
    }
    .row {
      display: flex;
      height: 40px;
      align-items: center;
      padding: 0 10px;
      width: 50%;
      min-width: 800px;
    }
    .row0 {      
      border-bottom: 1px solid #8080808a !important;
    }
    .row0:hover {
      background-color: #d0d0d0;
      cursor: pointer;
    }
    input[type=checkbox] {
       transform: scale(2);
       cursor: pointer;
    }
    .col {
      display: flex;
      align-items: center;
      height: 100%;
    }
    .col:nth-child(1) {
      width: 40px;
    }
    .col:nth-child(2) {
      flex: 4;
    }
    .col:nth-child(3) {
      flex: 2;
    }
    .col:nth-child(4) {
      flex: 2;
      display: flex;
      justify-content: flex-end;
    }
    button {
      padding: 4px 12px;
      margin: 12px 0;
      cursor: pointer;
    }
    `;
  if (typeof GM_addStyle != "undefined") {
    GM_addStyle(css);
  } else if (typeof PRO_addStyle != "undefined") {
    PRO_addStyle(css);
  } else if (typeof addStyle != "undefined") {
    addStyle(css);
  } else {
    var node = document.createElement("style");
    node.type = "text/css";
    node.appendChild(document.createTextNode(css));
    var heads = document.getElementsByTagName("head");
    if (heads.length > 0) {
      heads[0].appendChild(node);
    } else {
      // no head yet, stick it whereever
      document.documentElement.appendChild(node);
    }
  }

  $("#search_file").keyup(function (e) {
    SearchOnList(e);
  });

  function SearchOnList() {
    var searchText = $("#search_file").val();
    console.log(searchText, $("pre a").length);
  }

  function GoToURL(url) {
    window.location.href = url;
  }

  function formatBytes(bytes, decimals) {
    if (bytes * 1 != bytes) return bytes;
    if (bytes == 0) return "0 Bytes";
    var k = 1024,
      dm = decimals || 2,
      sizes = ["B&nbsp;", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"],
      i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
  }

  function redraw(ff) {
    var ffList = [];
    ffList.push(
      $(`
        <div class='row0'>
          <div class='row' style='height:40px'>
          <div class='col'><input type='checkbox' id='checkall' /></div>
          <div class='col'>Name</div>
          <div class='col'>Modified</div>
          <div class='col'>Size</div>
        </div>
      `)
    );
    var searchText = $("#search").val() || "";
    $(
      ff.folder.filter(function (obj) {
        return searchText != ""
          ? !!obj.name.match(new RegExp(searchText, "i"))
          : true;
      })
    ).each(function (i, o) {
      if (o.name.match(/\.\./)) return;
      ffList.push(
        $(
          `
                <div class='folderRow row0' style='height:40px' url='${o.name}'>
                  <div class='row'>
                    <div class='col'></div>
                    <div class='col'>${o.name}</div>
                    <div class='col'>${o.time}</div>
                    <div class='col'>${formatBytes(o.size)}</div>
                  </div>
                </div>
                `
        )
      );
    });
    $(
      ff.file.filter(function (obj) {
        console.log(
          obj.name,
          searchText,
          !!obj.name.match(new RegExp(searchText, "i"))
        );
        return searchText != ""
          ? !!obj.name.match(new RegExp(searchText, "i"))
          : true;
      })
    ).each(function (i, o) {
      ffList.push(
        $(
          `
                <div class='fileRow row0' style='height:40px'>
                  <div class='row'>
                    <div class='col'><input type='checkbox'></div>
                    <div class='col'><a href='${o.name}'>${o.name}</a></div>
                    <div class='col'>${o.time}</div>
                    <div class='col'>${formatBytes(o.size)}</div>
                  </div>
                </div>
                `
        )
      );
    });
    return ffList;
  }

  const delay = (milliseconds) =>
    new Promise((resolve) => {
      setTimeout(resolve, milliseconds);
    });

  (function () {
    var ThePath = $("h1").text();
    var links = $("pre").text().split(/\r?\n/);
    $(document.body).empty();
    var ff = { folder: [], file: [] };
    $(links).each(function (i, t) {
      var temp = t.split(/ +/);
      var name = temp.shift();
      var size = temp.pop();
      var time = temp.join(" ");
      if (!name) return;
      var ptr = "";
      console.log(name, size, time);
      if (name.match(/\//)) {
        ptr = "folder";
      } else {
        ptr = "file";
      }
      console.log("ff", ptr, name);
      ff[ptr].push({ name: name, time: time, size: size });
    });

    var HomeIcon = `<svg class="MuiSvgIcon-root MuiSvgIcon-fontSizeLarge  css-c1sh5i HomeIcon" focusable="false" aria-hidden="true" viewBox="0 0 24 24" data-testid="HomeIcon" aria-label="fontSize large"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"></path></svg>`;
    var ArrowForward = `<svg class="MuiSvgIcon-root MuiSvgIcon-fontSizeMedium MuiBox-root css-1om0hkc ArrowForwardIcon" focusable="false" aria-hidden="true" viewBox="0 0 24 24" data-testid="ArrowForwardIosIcon"><path d="M6.23 20.23 8 22l10-10L8 2 6.23 3.77 14.46 12z"></path></svg>`;

    var banner = $(`<div class="banner"></div>`);
    var ThePaths = ThePath.split("/");
    ThePaths.shift();
    ThePaths.pop();
    var CurrentPath = ThePaths.pop();
    banner.append(`<div><a href='/'>${HomeIcon}</a></div>`);
    var ptr2 = [];
    ThePaths.forEach(function (n) {
      ptr2.push(n);
      banner.append(`<div>${ArrowForward}</div>`);
      banner.append(`<div><a href='/` + ptr2.join("/") + `'>${n}</a></div>`);
    });
    banner.append(`<div>${ArrowForward}</div>`);
    banner.append(`<div>${CurrentPath}</div>`);

    var search = $(`<div class="search"></div>`);
    search.append(`<div class="search">Search:</div>`);
    search.append(`<div class="search"><input id="search" /></div>`);
    search.append(`<button id='download'>Download Selected</button>`);

    $(document.body).append(banner);
    $(document.body).append(search);
    $(document.body).append($(`<div id='FFList'></div>`).append(redraw(ff)));

    $("#search").keyup(function () {
      $("#FFList").empty().append(redraw(ff));
    });

    $("#checkall").click(function () {
      $(":checkbox").not("#checkall").prop("checked", this.checked);
    });

    $(".folderRow").click(function () {
      GoToURL(this.getAttribute("url"));
      // $(this).find("input").click();
      // console.log("row clicked");
    });
    $("#download").click(function () {
      $(":checkbox")
        .not("#checkall")
        .each(async function (i, o) {
          setTimeout(function () {
            $(o).parents(".row").eq(0).find("a")[0].click();
          }, i * 1000);
        });
    });
    // $("input[type=checkbox]").click(function (e) {
    //   console.log("input clicked");
    //   e.stopPropagation();
    // });
    // console.log(ff);
  })();
})();

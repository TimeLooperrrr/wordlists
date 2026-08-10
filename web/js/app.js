/* 常用英语单词 10000 - 单页应用 */
(function () {
  "use strict";

  var GROUPS = 10;
  var BATCH = 400; // 渐进渲染批次
  var state = {
    groups: {},   // g -> [words]
    query: "",
    g: 0,         // 0 = 全部
    view: [],     // 当前过滤后的索引数组 [{g, i}]
    rendered: 0,  // 已渲染条数(view 内)
  };

  var $ = function (id) { return document.getElementById(id); };
  var listEl = $("list"), countEl = $("count"), searchEl = $("search"),
      loadbarEl = $("loadbar"), fillEl = $("loadbar-fill"), loadbarText = $("loadbar-text"),
      emptyEl = $("empty"), sentinelEl = $("sentinel");

  /* ---------- 词库加载 ---------- */
  function loadAll() {
    loadbarEl.classList.remove("hidden");
    var tasks = [];
    for (let g = 1; g <= GROUPS; g++) {
      tasks.push(
        fetch("data/" + g + ".json")
          .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
          .then(function (arr) { state.groups[g] = arr; })
          .catch(function (e) { console.error("chunk 加载失败", e); })
      );
    }
    Promise.all(tasks).then(function () {
      loadbarEl.classList.add("hidden");
      fillEl.style.width = "100%";
      applyFilter();
    });
    // 进度条
    var done = 0;
    tasks.forEach(function (p) {
      p.then(function () {
        done++;
        fillEl.style.width = Math.round(done / GROUPS * 100) + "%";
        loadbarText.textContent = "加载词库中 " + done + "/" + GROUPS;
      });
    });
  }

  /* ---------- 过滤 ---------- */
  function applyFilter() {
    var q = state.query.trim().toLowerCase();
    var view = [];
    var groups = state.g ? [state.g] : [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    for (var gi = 0; gi < groups.length; gi++) {
      var g = groups[gi];
      var arr = state.groups[g];
      if (!arr) continue;
      for (var i = 0; i < arr.length; i++) {
        var it = arr[i];
        if (q) {
          var hit = it.w.toLowerCase().indexOf(q) !== -1 ||
                    (it.t && it.t.toLowerCase().indexOf(q) !== -1);
          if (!hit) continue;
        }
        view.push({ g: g, i: i });
      }
    }
    state.view = view;
    state.rendered = 0;
    listEl.innerHTML = "";
    emptyEl.classList.toggle("hidden", view.length !== 0);
    renderMore();
    updateCount();
  }

  function updateCount() {
    var total = state.g
      ? (state.groups[state.g] ? state.groups[state.g].length : 0)
      : 10000;
    countEl.textContent = "显示 " + state.view.length + " / " + total;
  }

  /* ---------- 渲染 ---------- */
  function renderMore() {
    var view = state.view;
    var end = Math.min(state.rendered + BATCH, view.length);
    var frag = document.createDocumentFragment();
    for (var k = state.rendered; k < end; k++) {
      frag.appendChild(buildRow(view[k]));
    }
    listEl.appendChild(frag);
    state.rendered = end;
    if (state.rendered < view.length) {
      sentinelEl.style.display = "block";
    } else {
      sentinelEl.style.display = "none";
    }
  }

  function buildRow(ref) {
    var it = state.groups[ref.g][ref.i];
    var li = document.createElement("li");
    li.className = "word-item";

    var rank = document.createElement("span");
    rank.className = "rank";
    rank.textContent = it.r;

    var word = document.createElement("span");
    word.className = "word";
    word.textContent = it.w;

    var phon = document.createElement("span");
    phon.className = "phon";
    phon.textContent = it.p || "";

    var trans = document.createElement("span");
    trans.className = "trans";
    if (it.t && it.t !== "[未收录]") {
      trans.appendChild(highlight(it.t));
    } else {
      var miss = document.createElement("span");
      miss.className = "notfound";
      miss.textContent = it.t || "(无释义)";
      trans.appendChild(miss);
    }

    li.appendChild(rank);
    li.appendChild(word);
    li.appendChild(phon);
    li.appendChild(trans);
    li.addEventListener("click", function () { speak(it.w); });
    return li;
  }

  /* 搜索词高亮(基于文本节点,安全无 XSS) */
  function highlight(text) {
    var q = state.query.trim().toLowerCase();
    if (!q) return document.createTextNode(text);
    var lower = text.toLowerCase();
    var out = document.createDocumentFragment();
    var pos = 0, idx;
    while ((idx = lower.indexOf(q, pos)) !== -1) {
      if (idx > pos) out.appendChild(document.createTextNode(text.slice(pos, idx)));
      var mark = document.createElement("mark");
      mark.textContent = text.slice(idx, idx + q.length);
      out.appendChild(mark);
      pos = idx + q.length;
    }
    if (pos < text.length) out.appendChild(document.createTextNode(text.slice(pos)));
    return out;
  }

  /* ---------- 发音 ---------- */
  var voiceSel = $("voice"), rateEl = $("rate"), rateVal = $("rate-val"), testBtn = $("voice-test");

  // 填充音色下拉(仅英语音色,按 lang 排序)
  function refreshVoices() {
    var voices = window.speechSynthesis ? speechSynthesis.getVoices() : [];
    var en = voices.filter(function (v) {
      return v.lang && v.lang.toLowerCase().indexOf("en") === 0;
    });
    var prev = localStorage.getItem("words-voice");
    voiceSel.innerHTML = "";
    if (!en.length) {
      var opt = document.createElement("option");
      opt.value = "";
      opt.textContent = "无可用英语音色";
      voiceSel.appendChild(opt);
      return;
    }
    en.forEach(function (v) {
      var opt = document.createElement("option");
      opt.value = v.name;
      opt.textContent = v.name + " (" + v.lang + ")";
      voiceSel.appendChild(opt);
    });
    if (prev) {
      for (var i = 0; i < voiceSel.options.length; i++) {
        if (voiceSel.options[i].value === prev) { voiceSel.selectedIndex = i; break; }
      }
    }
  }
  if ("speechSynthesis" in window) speechSynthesis.onvoiceschanged = refreshVoices;
  refreshVoices();

  function pickVoice() {
    var voices = window.speechSynthesis ? speechSynthesis.getVoices() : [];
    var name = voiceSel.value;
    for (var i = 0; i < voices.length; i++) {
      if (voices[i].name === name) return voices[i];
    }
    for (var j = 0; j < voices.length; j++) {
      if (voices[j].lang && voices[j].lang.toLowerCase().indexOf("en-us") === 0) return voices[j];
    }
    for (var k = 0; k < voices.length; k++) {
      if (voices[k].lang && voices[k].lang.toLowerCase().indexOf("en") === 0) return voices[k];
    }
    return null;
  }

  function speak(w) {
    if (!("speechSynthesis" in window)) return;
    speechSynthesis.cancel();
    var u = new SpeechSynthesisUtterance(w);
    u.lang = "en-US";
    u.rate = parseFloat(rateEl.value) || 0.65;
    var v = pickVoice();
    if (v) u.voice = v;
    speechSynthesis.speak(u);
  }

  // 音色/语速设置(记忆到 localStorage)
  var savedRate = localStorage.getItem("words-rate");
  if (savedRate) rateEl.value = savedRate;
  rateVal.textContent = parseFloat(rateEl.value).toFixed(2) + "x";

  voiceSel.addEventListener("change", function () {
    localStorage.setItem("words-voice", voiceSel.value);
    speak("Hello, this is a test.");
  });
  rateEl.addEventListener("input", function () {
    rateVal.textContent = parseFloat(rateEl.value).toFixed(2) + "x";
    localStorage.setItem("words-rate", rateEl.value);
  });
  testBtn.addEventListener("click", function () { speak("Hello, this is a test."); });

  /* ---------- 事件 ---------- */
  var timer = null;
  searchEl.addEventListener("input", function () {
    clearTimeout(timer);
    timer = setTimeout(function () {
      state.query = searchEl.value;
      applyFilter();
    }, 120);
  });

  document.getElementById("groups").addEventListener("click", function (e) {
    var btn = e.target.closest(".grp");
    if (!btn) return;
    document.querySelectorAll(".grp").forEach(function (b) { b.classList.remove("active"); });
    btn.classList.add("active");
    state.g = parseInt(btn.dataset.g, 10);
    applyFilter();
  });

  // 无限滚动
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(function (entries) {
      if (entries[0].isIntersecting && state.rendered < state.view.length) {
        renderMore();
      }
    }, { rootMargin: "600px" }).observe(sentinelEl);
  } else {
    window.addEventListener("scroll", function () {
      if (window.innerHeight + window.scrollY > document.body.scrollHeight - 800) renderMore();
    });
  }

  loadAll();
})();

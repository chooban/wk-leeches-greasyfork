// ==UserScript==
// @name         Shin WaniKani Leech Trainer
// @version      2.8.3
// @description  Study and quiz yourself on your leeches!
// @require      https://unpkg.com/wanakana@4.0.2/umd/wanakana.min.js
// @author       rosshendry, forked from hitechbunny
// @include      /^https://(www|preview).wanikani.com/(dashboard)?$/
// @run-at       document-end
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_deleteValue
// @grant        GM_registerMenuCommand
// @namespace https://greasyfork.org/users/149329
// ==/UserScript==

(function() {
    'use strict';

    const baseUrl = 'https://wk-stats.herokuapp.com/'

    // Hook into App Store
    try { $('.app-store-menu-item').remove(); $('<li class="app-store-menu-item"><a href="https://community.wanikani.com/t/there-are-so-many-user-scripts-now-that-discovering-them-is-hard/20709">App Store</a></li>').insertBefore($('.navbar .dropdown-menu .nav-header:contains("Account")')); window.appStoreRegistry = window.appStoreRegistry || {}; window.appStoreRegistry[GM_info.script.uuid] = GM_info; localStorage.appStoreRegistry = JSON.stringify(appStoreRegistry); } catch (e) {}

    var css =
        '.noselect {-webkit-touch-callout:none; -webkit-user-select:none; -khtml-user-select:none; -moz-user-select: none;'+
        '-ms-user-select:none; user-select: none;}'+

        '.selfstudy {margin-left:20px; margin-bottom:10px; position:relative;}'+
        '.selfstudy label {display:inline; vertical-align:middle; padding-right:4px; color:#999; font-family:"Open Sans","Helvetica Neue",Helvetica,Arial,sans-serif; text-shadow:0 1px 0 #fff;}'+
        '.selfstudy button.enable {width:55px;}'+
        '.ss_active .selfstudy button.enable.on {background-color:#b3e6b3; background-image:linear-gradient(to bottom, #ecf9ec, #b3e6b3);}'+
        '.selfstudy select.config {width:300px;}'+

        '.selfstudy .center {display:block; position:relative; top:50%; left:50%; transform:translate(-50%,-50%);}'+

        'section[id^="level-"].ss_active.ss_hidechar .character-item a span:not(.dummy) {opacity:0; transition:opacity ease-in-out 0.15s}'+
        'section[id^="level-"].ss_active.ss_hideread .character-item a li[lang="ja"] {opacity:0; transition:opacity ease-in-out 0.15s}'+
        'section[id^="level-"].ss_active.ss_hidemean .character-item a li:not([lang="ja"]) {opacity:0; transition:opacity ease-in-out 0.15s}'+
        'section[id^="level-"].ss_active.ss_hideburned .character-item.burned {display:none;}'+
        'section[id^="level-"].ss_active.ss_hidelocked .character-item.locked {display:none;}'+
        'section[id^="level-"].ss_active.ss_hideunburned .character-item:not(.burned) {display:none;}'+
        'section[id^="level-"].ss_active.ss_hideunlocked .character-item:not(.locked) {display:none;}'+

        'section.ss_active .character-item:hover a span {opacity: initial !important; transition:opacity ease-in-out 0.05s !important;}'+
        'section.ss_active .character-item:hover a li {opacity: initial !important; transition:opacity ease-in-out 0.05s !important;}'+

        '#ss_config {position:absolute; z-index:1029; width:573px; background-color:rgba(0,0,0,0.9); border-radius:8px; padding:8px;}'+

        '#ss_config select.configs {width:475px;}'+
        '#ss_config label {color:#ccc; text-shadow:initial; text-align:right; vertical-align:baseline;}'+
        '#ss_config .btns {display:inline-block; float:left; vertical-align:top; margin-right:8px;}'+
        '#ss_config .btns .btn {display:block; margin-bottom:5px;}'+
        '#ss_config .btn {width:70px;}'+

        '#ss_config .list {overflow-x:auto;}'+
        '#ss_config .list select.configs {width:100%; height:135px;}'+

        '#ss_config .section {border-top:1px solid #ccc; padding:0 0 8px 0;}'+
        '#ss_config .section > label {display:block; text-align:left; color:#ffc; font-size:1.2em; font-weight:bold; padding-left:4px; margin-bottom:4px; background-color:#2e2e2e; background-image:linear-gradient(to bottom, #3c3c3c, #1a1a1a); background-repeat:repeat-x;}'+

        '#ss_config .txtline label {display:inline-block; float:left; margin-right:8px; width:100px; line-height:30px; clear:both;}'+
        '#ss_config .txtline .expand {overflow-x:auto;}'+
        '#ss_config .txtline input {box-sizing:border-box; width:100%; height:30px;}'+

        '#ss_config .cbbox {display:inline-block; width:49%; vertical-align:top;}'+
        '#ss_config .cbbox label {display:inline-block; float:left; margin:0 8px 0 0; width:190px; line-height:20px;}'+
        '#ss_config .cbbox input {position:relative; overflow-x:auto; height:20px; margin:0; top:1px;}'+

        '#ss_config [class*="icon-"] {color:#fff;}'+

        '#ss_config .dlg_close {text-align:center; margin-top:16px; margin-bottom:8px;}'+

        '#ss_quiz [lang="ja"] {font-family: "Meiryo","Yu Gothic","Hiragino Kaku Gothic Pro","TakaoPGothic","Yu Gothic","ヒラギノ角ゴ Pro W3","メイリオ","Osaka","MS PGothic","ＭＳ Ｐゴシック",sans-serif;}'+
        '#ss_quiz {position:absolute; z-index:1028; width:573px; background-color:rgba(0,0,0,0.85); border-radius:8px; border:8px solid rgba(0,0,0,0.85); font-size:2em;}'+
        '#ss_quiz * {text-align:center;}'+
        '#ss_quiz .qwrap {height:8em; position:relative; clear:both;}'+

        '#ss_quiz.radicals .qwrap, #ss_quiz.radicals .summary .que {background-color:#0af;}'+
        '#ss_quiz.kanji .qwrap, #ss_quiz.kanji .summary .que {background-color:#f0a;}'+
        '#ss_quiz.vocabulary .qwrap, #ss_quiz.vocabulary .summary .que {background-color:#a0f;}'+

        '#ss_quiz .prev, #ss_quiz .next {display:inline-block; width:80px; color:#fff; line-height:8em; cursor:pointer;}'+
        '#ss_quiz .prev:hover {background-image:linear-gradient(to left, rgba(0,0,0,0), rgba(0,0,0,0.2));}'+
        '#ss_quiz .next:hover {background-image:linear-gradient(to right, rgba(0,0,0,0), rgba(0,0,0,0.2));}'+
        '#ss_quiz .prev {float:left;}'+
        '#ss_quiz .next {float:right;}'+

        '#ss_quiz .topbar {font-size:0.5em; line-height:1em; color: rgba(255,255,255,0.5);}'+

        '#ss_quiz .settings {float:left; padding:6px 8px; text-align:left; line-height:1.5em;}'+
        '#ss_quiz .settings span[class*="icon-"] {font-size:1.3em; padding:0 2px;}'+
        '#ss_quiz .settings .ss_audio {padding-left:0; padding-right:4px;}'+
        '#ss_quiz .settings .ss_typo {padding-left:0px;}'+
        '#ss_quiz .settings .ss_done {font-size:1.25em;}'+
        '#ss_quiz .settings .ss_pair {font-weight:bold;}'+
        '#ss_quiz .settings span {cursor:pointer;}'+
        '#ss_quiz .settings span:hover {color:rgba(255,255,204,0.8);}'+
        '#ss_quiz .settings span.active {color:#ffc;}'+
        '#ss_quiz.help .settings .ss_help {color:#ffc;}'+

        '#ss_quiz .stats_labels {text-align:right; font-family:monospace;}'+
        '#ss_quiz .stats {float:right; text-align:right; color:rgba(255,255,255,0.8); font-family:monospace; padding:0 5px;}'+

        '#ss_quiz .round {display:none; font-weight:bold; position:absolute; box-sizing:border-box; width:60%; height:75%; border-radius:24px; border:2px solid #000; background-color:#fff;}'+
        '#ss_quiz.round .round {display:block;}'+

        '#ss_quiz .question {'+
        '  overflow-x:auto; overflow-y:hidden; position:relative; top:50%; transform:translateY(-50%);'+
        '  color:#fff; text-align:center; line-height:1.1em; font-size:1em; font-weight:bold; cursor:default;'+
        '}'+
        '#ss_quiz .question[data-type="char"] {font-size:2em;}'+
        '#ss_quiz .icon-audio:before {content:"\\f028";}'+
        '#ss_quiz .question .icon-audio {font-size:2.5em; cursor:pointer;}'+
        '#ss_quiz.summary .question {display:none;}'+

        '#ss_quiz .qtype {line-height:2em; cursor:default; text-transform:capitalize;}'+
        '#ss_quiz .qtype.reading {color:#fff; text-shadow:-1px -1px 0 #000; border-top:1px solid #555; border-bottom:1px solid #000; background-color:#2e2e2e; background-image:linear-gradient(to bottom, #3c3c3c, #1a1a1a); background-repeat:repeat-x;}'+
        '#ss_quiz .qtype.meaning {color:#555; text-shadow:-1px -1px 0 rgba(255,255,255,0.1); border-top:1px solid #d5d5d5; border-bottom:1px solid #c8c8c8; background-color:#e9e9e9; background-image:linear-gradient(to bottom, #eee, #e1e1e1); background-repeat:repeat-x;}'+

        '#ss_quiz .help {display:none;'+
        '  position:absolute; top:3%; left:13%; width:74%; box-sizing:border-box; border:2px solid #000; border-radius:15px; padding:4px;'+
        '  color:#555; text-shadow:2px 2px 0 rgba(0,0,0,0.2); background-color:rgba(255,255,255,0.9); font-size:0.8em; line-height:1.2em;'+
        '}'+
        '#ss_quiz.help .help {display:inherit;}'+

        '#ss_quiz .answer {background-color:#ddd; padding:8px;}'+
        '#ss_quiz .answer input {'+
        '  width:100%; background-color:#fff; height:2em; margin:0; border:2px solid #000; padding:0;'+
        '  box-sizing:border-box; border-radius:0; font-size:1em;'+
        '}'+
        '#ss_quiz .answer input.correct {color:#fff; background-color:#8c8; text-shadow:2px 2px 0 rgba(0,0,0,0.2);}'+
        '#ss_quiz .answer input.incorrect {color:#fff; background-color:#f03; text-shadow:2px 2px 0 rgba(0,0,0,0.2);}'+

        '#ss_quiz.loading .qwrap, #ss_quiz.loading .answer {display:none;}'+

        '#ss_quiz .summary {display:none; position:absolute; width:74%; height:100%; background-color:rgba(0,0,0,0.7); color:#fff; font-weight:bold;}'+
        '#ss_quiz.summary .summary {display:block;}'+
        '#ss_quiz .summary h3 {'+
        '  background-image:linear-gradient(to bottom, #3c3c3c, #1a1a1a); background-repeat:repeat-x;'+
        '  border-top:1px solid #777; border-bottom:1px solid #000; margin:0; box-sizing:border-box;'+
        '  text-shadow:2px 2px 0 rgba(0,0,0,0.5); color:#fff; font-size:0.8em; font-weight:bold; line-height:40px;'+
        '}'+
        '#ss_quiz .summary .errors {position:absolute; top:40px; bottom:0px; width:100%; margin:0; overflow-y:auto; list-style-type:none;}'+
        '#ss_quiz .summary li {margin:4px 0 0 0; font-size:0.6em; font-weight:bold; line-height:1.4em;}'+

        '#ss_quiz .summary .errors span {display:inline-block; padding:2px 4px 0px 4px; border-radius:4px; line-height:1.1em; max-width:50%; vertical-align:middle; cursor:pointer;}'+
        '#ss_quiz .summary .ans {background-color:#fff; color:#000;}'+
        '#ss_quiz .summary .wrong {color:#f22;}'+

        '#ss_quiz .btn.requiz {position:absolute; top:6px; right:6px; padding-left:6px; padding-right:6px;}'+

        '#ss_quiz_container {position:absolute; top:0; left:0; width:100%}'+

        '#ss_quiz {position: fixed;    margin-left: auto;    margin-right: auto;    left: 0;    right: 0;    top: 6em;}'+

        '#ss_quiz .quiz-progress {margin-bottom: 8px; height: 8px; background-color: gray;}'+

        '#ss_quiz .quiz-progress .quiz-progress-bar {height: 8px; background-color: white;}'+

        '#ss_quiz .quiz-progress .quiz-progress-bar.pulse { animation: pulse 1.5s ease-in-out infinite alternate; }'+
        '@keyframes pulse { 0% { box-shadow: 0px 0px 5px white; } 25% { box-shadow: 0px 0px 20px white; } 75% { box-shadow: 0px 0px 20px white; } 100% { box-shadow: 0px 0px 5px white; } }'+

        '#ss_quiz_abort { position: fixed; top: 0; left: 0; bottom: 0; right: 0; z-index: 999; }'+

        '';

    var quiz_html =
        '<div id="ss_quiz" class="kanji reading">'+
        '  <div class="quiz-progress"><div class="quiz-progress-bar"></div></div>'+
        '  <div class="qwrap">'+
        '    <div class="question"></div>'+
        '    <div class="help"></div>'+
        '    <div class="summary center">'+
        '      <h3>Summary - <span class="percent">100%</span> Correct <button class="btn requiz" title="Re-quiz wrong items">Re-quiz</button></h3>'+
        '      <ul class="errors"></ul>'+
        '    </div>'+
        '    <div class="round center"><span class="center">Round 1</span></div>'+
        '  </div>'+
        '  <div class="qtype"></div>'+
        '  <div class="answer"><input type="text" value=""></div>'+
        '</div>';

    $('head').append('<style type="text/css">'+css+'</style>');

    var KEY_API_KEY = 'wkApiKeyV2'
    var KEY_LEECH_CACHE = 'wkLeechCache'

    // I don't think this is used by anything. TBD.
    var KEY_LEECHES_TRAINED = 'wkLeechesTrained'

    var quiz;
    var dialog;
    var correct = [];
    var incorrect = [];
    var wanakana_isbound;
    var quizInProgress = false;

    GM_registerMenuCommand("WaniKani Leech Trainer: Set API key", promptApiKey);

    function promptApiKey() {
        var currentApiKey = GM_getValue(KEY_API_KEY) || ''
        var possibleApiKey = null
        while(true) {
            possibleApiKey = window.prompt("Please enter your API key", currentApiKey)
            if (typeof possibleApiKey === 'string' && possibleApiKey.length === 36) {
                GM_setValue(KEY_API_KEY, possibleApiKey)
                break
            } else if (possibleApiKey === null) {
                // User clicked cancel
                break
            } else {
                alert("That does not look like a valid key, please try again")
            }
        }
    }

    function clear() {
        $('.sitemap__section__leeches').remove();
        var leechButton = `
        <li class="sitemap__section sitemap__section__leeches">
          <h2 class="sitemap__section-header sitemap__section-header--leeches" data-navigation-section-toggle="" data-expanded="false" role="button">
            <span lang="ja">蛭達</span>
            <span lang="en">Leeches</span>
          </h2>
          <div class="sitemap__expandable-chunk sitemap__expandable-chunk--leeches" data-navigation-section-content="" data-expanded="false" aria-expanded="false">
            <ul class="sitemap__pages sitemap__pages--leeches">
              <li class="sitemap__page sitemap__page--leech">
                You have <span class="leech-count">X</span> leeches
              </li>
              <li class="sitemap__page sitemap__page--leech">
                <button style="width: 100%;" class="leeches-start-quiz">Squash some leeches!</button>
              </li>
            </ul>
          </div>
        </li>`

        var parentElement = $('.navigation .sitemap__section-header--vocabulary').parent()
        if (!parentElement.length) {
            console.log('Could not find the vocabulary button to attach to')
            return
        }

        var btnElement = $(leechButton)
        btnElement.click(function(event) {
            event.stopImmediatePropagation()
            var header = $(this).find('h2.sitemap__section-header')
            var sitemap = $(this).find('div.sitemap__expandable-chunk')
            var toggleTo = header.attr('data-expanded') === 'true' ? 'false' : 'true'

            header.attr('data-expanded', toggleTo)
            sitemap.attr('data-expanded', toggleTo)
        })
        btnElement.insertAfter(parentElement)
    }

    function query() {
        clear();
        var leechCache = GM_getValue(KEY_LEECH_CACHE) || ''

        if (leechCache) {
            render(JSON.parse(leechCache));
        }
        get_api_key().then(function() {
            var apiKey = GM_getValue(KEY_API_KEY)
            ajax_retry(baseUrl + '/leeches/lesson?api_key='+apiKey, {timeout: 0}).then(function(json) {
                clear();
                render(json);
            });
        });
    }

    function render(json) {
        GM_setValue(KEY_LEECH_CACHE, JSON.stringify(json));
        if (quizInProgress) {
            return;
        }
        quiz = json.leech_lesson_items;
        console.info(json)
        $('.navigation span.leech-count').html(json.leeches_available)
        $('.navigation .sitemap__section__leeches button').click(startQuiz);
    }

    function startQuiz(e) {
        // The default action is to navigate to /, so let's not do that.
        e.preventDefault();

        if (quiz.length === 0) return;
        quizInProgress = true;

        for(var i=0; i<3; i++) {
            shuffle(quiz);
            var last = null;
            var duplicate = false;
            quiz.forEach(function(leech) {
                var key = leech.type + "/" + leech.name;
                if (key == last) {
                    duplicate = true;
                }
                last = key;
            });
            if (!duplicate) break;
        }

        correct = [];
        incorrect = [];

        $('#ss_quiz, #ss_quiz_abort').remove();
        $('body').append('<div id="ss_quiz_abort"/>').append(quiz_html);
        $('.navbar, #search, .dashboard, footer').css('filter', 'blur(20px)');
        wanakana_isbound = false;

        dialog = $('#ss_quiz');

        $('.quiz-progress-bar').css('width', (correct.length*100.0 / (quiz.length))+'%');

        dialog.find('.answer input').on('keypress', onKeyPress);

        $('#ss_quiz_abort').click(closeQuiz);

        show_next();
    }

    function closeQuiz() {
        $('.navbar, #search, .dashboard, footer').css('filter', 'none');
        $('#ss_quiz, #ss_quiz_abort').remove();
        quizInProgress = false;
        query();
    }

    function onKeyPress(e) {
        var code = e.originalEvent
        ? (e.originalEvent.charCode ? e.originalEvent.charCode : e.originalEvent.keyCode ? e.originalEvent.keyCode : 0)
        : (e.charCode ? e.charCode : e.keyCode ? e.keyCode : 0);

        if (dialog.find('.help').is(':visible')) {
            dialog.find('.help').hide();
            $('#ss_quiz .answer input').val('').focus().select();
        } else if (code === 13) {
            var answerGiven = $('#ss_quiz .answer input').val().trim();
            if (e.ctrlKey) answerGiven = quiz[0].correct_answers[0];
            if (answerGiven.length === 0) return;
            if (quiz[0].train_type == 'reading') {
                answerGiven = wanakana.toHiragana(answerGiven).trim();
                if (answerGiven.indexOf("n") == answerGiven.length-1) {
                    answerGiven = answerGiven.substring(0,answerGiven.length-1)+"ん";
                }
            }
            $('#ss_quiz .answer input').val(answerGiven);
            var correctAnswers = quiz[0].correct_answers;
            var tryAgainAnswers = quiz[0].try_again_answers;

            var matches = function(answer) {
                if (quiz[0].train_type == 'reading') {
                    return answer == answerGiven;
                } else {
                    return jw_distance(answer.toLowerCase(), answerGiven.toLowerCase()) > 0.9;
                }
            };

            if (quiz[0].train_type == 'reading' && !wanakana.isKana(answerGiven)) {
                shake($('#ss_quiz .answer input'));
            } else if (correctAnswers.filter(matches).length > 0) {
                $('#ss_quiz .answer input').addClass('correct').blur();
                correct.push(quiz[0].leech);
                quiz = quiz.slice(1);
                if (e.ctrlKey) {
                    show_next();
                } else {
                    setTimeout(show_next, 750);
                }
            } else if (tryAgainAnswers.filter(matches).length > 0) {
                shake($('#ss_quiz .answer input'));
            } else {
                shake($('#ss_quiz .answer input'));
                $('#ss_quiz .answer input').select();
                dialog.find('.help').html('<a href="/'+quiz[0].type+'/'+quiz[0].name+'" target="_blank">'+quiz[0].correct_answers[0]+'</a>').attr('lang','ja').show();

                incorrect.push(quiz[0].leech);
            }
        } else {
            dialog.find('.help').hide();
        }
        $('.quiz-progress-bar').animate({width: (correct.length*100.0 / (correct.length+quiz.length))+'%'}, 250);
    }

    function shake(elem) {
        var dist = '25px';
        var speed = 75;
        var right = {padding:'0 '+dist+' 0 0'}, left = {padding:'0 0 0 '+dist}, center = {padding:"0 0 0 0"};

        elem.animate(left,speed/2).animate(right,speed)
            .animate(left,speed).animate(right,speed)
            .animate(left,speed).animate(center,speed/2);
    }

    function show_next() {
        if (quiz.length === 0) {
            $('.quiz-progress-bar').addClass('pulse');
            $('#ss_quiz_abort').css('z-index', 1031);

            var trainedLeeches = [];
            correct.forEach(function(leech) {
                if (!trainedLeeches.find(function(l) { return l.key == leech.key; }) && !incorrect.find(function(l) { return l.key == leech.key; })) {
                    trainedLeeches.push(leech);
                }
            });

            var msg = (trainedLeeches.length === 0 ? "Sorry. No leeches trained." : trainedLeeches.length+" leech"+(trainedLeeches > 1 ? "es" : "")+" trained!");
            dialog.find('.help').html(msg).attr('lang','en').show();

            var extras = JSON.parse(GM_getValue(KEY_LEECHES_TRAINED) || '{}');
            Object.keys(extras).forEach(function(key) {
                if (!trainedLeeches.find(function(l) { return l.key == key; }) && !incorrect.find(function(l) { return l.key == key; })) {
                    trainedLeeches.push({key: key, worst_incorrect: extras[key]});
                }
            });
            var apiKey = GM_getValue(KEY_API_KEY)
            ajax_retry(baseUrl + '/leeches/trained?api_key='+apiKey, {data: JSON.stringify(trainedLeeches), method: 'POST', timeout: 0}).then(function(json) {
                GM_deleteValue(KEY_LEECHES_TRAINED)
                setTimeout(function() {
                    closeQuiz();
                }, 2500)
            });

            return;
        }

        var item = quiz[0];
        var qtype = 'char';
        var qlang = 'ja';
        var qtext = item.name;
        var atype = item.train_type;
        var alang = 'ja';
        var itype = item.type;

        dialog.find('.question').attr('data-type', qtype).attr('lang',qlang).html(qtext);
        var type_text = itype + ' <strong>'+atype+'</strong>';
        dialog.find('.qtype').removeClass('reading meaning').addClass(atype).html(type_text);
        dialog.removeClass('kanji vocabulary').addClass(itype);

        $('#ss_quiz .answer input').attr('lang',alang).removeClass('correct').val('').focus().select();

        if (atype === 'reading') {
            if (!wanakana_isbound) {
                wanakana.bind($('#ss_quiz .answer input')[0]);
                wanakana_isbound = true;
            }
        } else {
            if (wanakana_isbound) {
                wanakana.unbind($('#ss_quiz .answer input')[0]);
                wanakana_isbound = false;
            }
        }
    }

    query();

    function shuffle(array) {
        var i = array.length, j, temp;
        if (i===0) return array;
        while (--i) {
            j = Math.floor(Math.random()*(i+1));
            temp = array[i]; array[i] = array[j]; array[j] = temp;
        }
        return array;
    }

    // Jaro-Winkler Distance
    function jw_distance(a, c) {
        var h, b, d, k, e, g, f, l, n, m, p;
        if (a.length > c.length) {
            c = [c, a];
            a = c[0];
            c = c[1];
        }
        k = ~~Math.max(0, c.length / 2 - 1);
        e = [];
        g = [];
        b = n = 0;
        for (p = a.length; n < p; b = ++n) {
            for (h = a[b], l = Math.max(0, b - k), f = Math.min(b + k + 1, c.length), d = m = l; l <= f ? m < f : m > f; d = l <= f ? ++m : --m) {
                if (g[d] === undefined && h === c[d]) {
                    e[b] = h;
                    g[d] = c[d];
                    break;
                }
            }
        }
        e = e.join("");
        g = g.join("");
        d = e.length;
        if (d) {
            b = f = k = 0;
            for (l = e.length; f < l; b = ++f) {
                h = e[b];
                if (h !== g[b]) k++;
            }
            b = g = e = 0;
            for (f = a.length; g < f; b = ++g) {
                if (h = a[b], h === c[b])
                    e++;
                else
                    break;
            }
            a = (d/a.length + d/c.length + (d - ~~(k/2))/d)/3;
            a += 0.1 * Math.min(e, 4) * (1 - a);
        } else {
            a = 0;
        }
        return a;
    }

    //-------------------------------------------------------------------
    // Fetch a document from the server.
    //-------------------------------------------------------------------
    function ajax_retry(url, options) {
        //console.log(url, retries, timeout);
        options = options || {};
        var retries = options.retries || 3;
        var timeout = options.timeout || 3000;
        var headers = options.headers || {};
        var method = options.method || 'GET';
        var data = options.data || undefined;
        var cache = options.cache || false;

        function action(resolve, reject) {
            $.ajax({
                url: url,
                method: method,
                timeout: timeout,
                headers: headers,
                data: data,
                cache: cache
            })
                .done(function(data, status){
                //console.log(status, data);
                if (status === 'success') {
                    resolve(data);
                } else {
                    //console.log("done (reject)", status, data);
                    reject();
                }
            })
                .fail(function(xhr, status, error){
                //console.log(status, error);
                if ((status === 'error' || status === 'timeout') && --retries > 0) {
                    //console.log("fail", status, error);
                    action(resolve, reject);
                } else {
                    reject();
                }
            });
        }
        return new Promise(action);
    }

    function get_api_key() {
        return new Promise(function(resolve, reject) {
            var apiKey = GM_getValue(KEY_API_KEY);
            if (typeof apiKey === 'string' && apiKey.length == 36) return resolve();

            // status_div.html('Fetching API key...');
            ajax_retry('/settings/personal_access_tokens').then(function(page) {

                // --[ SUCCESS ]----------------------
                // Make sure what we got is a web page.
                if (typeof page !== 'string') {return reject();}

                // Extract the user name.
                page = $(page);

                // Extract the API key.
                var possibleApiKey = page.find('table#personal-access-tokens-list tbody tr:last-of-type code')[0].innerText;
                if (typeof possibleApiKey !== 'string' || possibleApiKey.length !== 36) {
                    return reject(new Error('generate_apikey'));
                }

                GM_setValue(KEY_API_KEY, possibleApiKey);
                resolve();

            },function(result) {
                // --[ FAIL ]-------------------------
                reject(new Error('Failed to fetch API key!'));

            });
        });
    }
})();

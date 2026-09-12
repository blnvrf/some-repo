// GLOBAL
const TEXT_FADE = 0.22;
const TEXT_EASE = 'power2.out';

function isMobile() {
  return window.matchMedia('(max-width: 991px)').matches;
}

const MOTION = {
  textFade: { duration: TEXT_FADE, ease: TEXT_EASE },
  sceneFade: { duration: 1, ease: 'power2.out' },
  float: {
    x: [-8, 8],
    y: [-16, -28],
    rotate: [-3.2, 3.2],
    duration: [2.4, 3.6],
    ease: 'sine.inOut'
  }
};

(function () {
  gsap.registerPlugin(ScrollTrigger);

  function $(selector, root = document) {
    return root.querySelector(selector);
  }

  function $$(selector, root = document) {
    return Array.from(root.querySelectorAll(selector));
  }

  function scrollTimeline(trigger, scrub, options = {}) {
    return gsap.timeline({
      scrollTrigger: { trigger, start: 'top top', end: 'bottom bottom', scrub, ...options }
    });
  }

  function fadeInAt(timeline, target, at, vars = {}) {
    const alpha = 'opacity' in vars ? 'opacity' : 'autoAlpha';
    return timeline.to(target, { [alpha]: 1, duration: TEXT_FADE, ease: TEXT_EASE, ...vars }, at);
  }

  function fadeOutAt(timeline, target, at, vars = {}) {
    const alpha = 'opacity' in vars ? 'opacity' : 'autoAlpha';
    return timeline.to(target, { [alpha]: 0, duration: TEXT_FADE, ease: TEXT_EASE, ...vars }, at);
  }

  function fadeIn(target, motion = MOTION.textFade) {
    return gsap.to(target, {
      autoAlpha: 1,
      duration: motion.duration,
      ease: motion.ease,
      overwrite: true
    });
  }

  function fadeOut(target, motion = MOTION.textFade) {
    return gsap.to(target, {
      autoAlpha: 0,
      duration: motion.duration,
      ease: motion.ease,
      overwrite: true
    });
  }

  function createFloat(target, motion = MOTION.float, delay = 0) {
    const timeline = gsap.timeline({
      repeat: -1,
      yoyo: true,
      paused: true,
      defaults: { ease: motion.ease }
    });

    timeline.to(
      target,
      {
        x: gsap.utils.random(motion.x[0], motion.x[1]),
        y: gsap.utils.random(motion.y[0], motion.y[1]),
        rotate: gsap.utils.random(motion.rotate[0], motion.rotate[1]),
        duration: gsap.utils.random(motion.duration[0], motion.duration[1])
      },
      delay
    );

    return timeline;
  }

  // SCROLL PROGRESS
  function initScrollProgress() {
    gsap.fromTo(
      '.scroll-progress-bar',
      { height: '8vh' },
      {
        height: '100vh',
        ease: 'none',
        scrollTrigger: {
          trigger: '.page-wrapper',
          start: 'top top',
          end: 'bottom bottom',
          scrub: 0.1
        }
      }
    );
  }

  // MADURO
  function initMaduroScroll() {
    const maduroTrack = $('[data-maduro-track="true"]');
    const maduroVisual = $('[data-maduro-visual="true"]');
    const maduroMessages = $$('[data-maduro-message]');
    const maduroPoints = [0.0, 0.15, 0.3, 0.45, 0.6, 0.85];

    if (!maduroTrack || !maduroVisual || !maduroMessages.length) {
      return;
    }

    delete document.body.dataset.maduroLock;

    const takeAction = $('[data-take-action]');

    if (takeAction) {
      takeAction.classList.remove('display-none');
    }

    let maduroActive = 0;

    function getAllTargets(message) {
      return $$('[data-fade], [data-maduro-date]', message);
    }

    function getVisibleTargets(message) {
      return getAllTargets(message).filter(function (element) {
        if (element.hasAttribute('data-maduro-date')) {
          return element.dataset.maduroDate === 'true';
        }

        return true;
      });
    }

    maduroMessages.forEach(function (message) {
      gsap.set(getAllTargets(message), { autoAlpha: 0 });
    });

    fadeIn(getVisibleTargets(maduroMessages[0]));

    function showMaduroMessage(index) {
      if (index === maduroActive || !maduroMessages[index]) {
        return;
      }

      const oldMessage = maduroMessages[maduroActive];
      const newMessage = maduroMessages[index];

      fadeOut(getAllTargets(oldMessage));

      fadeIn(getVisibleTargets(newMessage));

      const maduroIsFinalPhase = index >= maduroMessages.length - 2;

      if (maduroIsFinalPhase) {
        fadeOut(maduroVisual, MOTION.sceneFade);
      } else {
        fadeIn(maduroVisual, MOTION.sceneFade);
      }

      maduroActive = index;
    }

    ScrollTrigger.create({
      trigger: maduroTrack,
      start: 'top top',
      end: 'bottom bottom',
      onUpdate(self) {
        let maduroIndex = 0;

        maduroPoints.forEach(function (point, index) {
          if (self.progress >= point) {
            maduroIndex = index;
          }
        });

        showMaduroMessage(maduroIndex);
      }
    });
  }

  // PIG
  function initPig() {
    $$('[data-pig]').forEach(function (sec) {
      var pq = gsap.utils.selector(sec);
      var track = pq('[data-pig-track]')[0];
      var stackWrap = pq('[data-stack-wrapper]')[0];
      var scale = pq('[data-pig-scale]')[0];
      var lines = pq('[data-pig-line]');
      var mainTitle = pq('[data-pig-main-title]')[0];
      var closingLine = pq('[data-pig-line-closing]')[0];
      var closingTxt = closingLine ? $('[data-pig-txt]', closingLine) : null;
      var intro = pq('[data-pig-intro="true"]')[0];
      var introTitle = intro ? $('[data-pig-intro-secondary-title]', intro) : null;
      var introLines = intro
        ? $$('[data-pig-line]', intro).filter(function (line) {
            if (introTitle && line.contains(introTitle)) {
              return false;
            }

            return true;
          })
        : [];
      var storyLines = lines.filter(function (line) {
        if (line === mainTitle) return false;

        if (line.hasAttribute('data-pig-line-closing')) {
          return false;
        }

        if (intro && intro.contains(line)) {
          return false;
        }

        return true;
      });
      var human = pq('[data-pig-human]');
      var op = pq('[data-pig-op]');
      var pigSide = pq('[data-pig-pigside]');
      var herdBox = pq('[data-pig-herd]')[0];
      var pigCount = pq('[data-pig-count="pig"]')[0];
      var quote = pq('[data-pig-quote]');

      if (!track || !storyLines.length || !herdBox) {
        return;
      }

      var seed = $('[data-pig-cell]', herdBox);

      if (!seed) return;

      var BEATS = [
        { pigs: 1, human: true },
        { pigs: 2, human: true },
        { pigs: 2, human: true },
        { pigs: 10, human: true }
      ];
      var HOLDS = [0.75, 0.75, 0.6, 0.75];
      var INTRO = {
        mainIn: 0,
        mainHold: 0.5,
        introTitleIn: 1,
        introLinesIn: 1.5,
        introOut: 2,
        gap: 0.15
      };
      var FIG = 0.12;
      var DROP = 0.24;
      var CLEAR = 0.16;
      var QUOTE_HOLD = 0.9;
      var QUOTE_AFTER = 3;

      function cellSize(n) {
        const mobile = isMobile();

        if (mobile && n === 10) {
          return { w: '50%', h: '20%' };
        }

        if (n <= 1) {
          return { w: '75%', h: '75%' };
        }

        if (n === 2) {
          return { w: '75%', h: '50%' };
        }

        if (n <= 4) {
          return { w: '75%', h: '25%' };
        }

        var cols = Math.ceil(n / 4);

        return { w: 75 / cols + '%', h: '25%' };
      }

      var HERD_TARGET = 10;
      var existing = herdBox.querySelectorAll('[data-pig-cell]').length;

      for (var p = existing; p < HERD_TARGET; p++) {
        herdBox.appendChild(seed.cloneNode(true));
      }

      var herd = $$('[data-pig-cell]', herdBox);

      gsap.context(function () {
        gsap.set([human, op, pigSide], { opacity: 0 });

        gsap.set(herd, { opacity: 0, display: 'none' });

        gsap.set(quote, { opacity: 0, xPercent: -50, yPercent: -50 });

        if (stackWrap) {
          gsap.set(stackWrap, { height: '100%', top: '0%', opacity: 1 });
        }

        if (scale) {
          gsap.set(scale, { yPercent: 100, opacity: 0 });
        }

        gsap.set(herdBox, {
          flexDirection: 'column',
          flexWrap: 'wrap',
          height: '100%',
          width: '100%'
        });

        var first = cellSize(1);

        gsap.set(herd, { width: first.w, height: first.h });

        if (mainTitle) {
          gsap.set(mainTitle, { opacity: 0 });
        }

        if (intro) {
          gsap.set(intro, { opacity: 1 });
        }

        if (introTitle) {
          gsap.set(introTitle, { opacity: 0 });
        }

        if (introLines.length) {
          gsap.set(introLines, { opacity: 0 });
        }

        storyLines.forEach(function (line) {
          var txt = $('[data-pig-txt]', line);

          if (txt) {
            gsap.set(txt, { opacity: 0 });
          }
        });

        if (closingTxt) {
          gsap.set(closingTxt, { opacity: 0 });
        }

        var pigTimeline = scrollTimeline(track, 0.4);

        if (mainTitle) {
          fadeInAt(pigTimeline, mainTitle, INTRO.mainIn, { opacity: 1 });

          fadeOutAt(pigTimeline, mainTitle, INTRO.mainHold, { opacity: 0 });
        }

        if (introTitle) {
          fadeInAt(pigTimeline, introTitle, INTRO.introTitleIn, { opacity: 1 });
        }

        if (introLines.length) {
          fadeInAt(pigTimeline, introLines, INTRO.introLinesIn, { opacity: 1 });
        }

        if (intro) {
          fadeOutAt(pigTimeline, intro, INTRO.introOut, { opacity: 0 });
        }

        var at = INTRO.introOut + TEXT_FADE + INTRO.gap;

        storyLines.forEach(function (line, i) {
          var span = HOLDS[i] !== undefined ? HOLDS[i] : 0.75;
          var txt = $('[data-pig-txt]', line);
          var beat = BEATS[i] || BEATS[BEATS.length - 1];
          var prev = i > 0 ? BEATS[i - 1] : { pigs: 0, human: false };

          if (txt) {
            fadeInAt(pigTimeline, txt, at, { opacity: 1 });

            if (i !== QUOTE_AFTER) {
              fadeOutAt(pigTimeline, txt, at + span - TEXT_FADE, { opacity: 0 });
            }
          }

          if (beat.pigs > 0 && prev.pigs === 0) {
            if (stackWrap) {
              pigTimeline.to(
                stackWrap,
                { height: '50%', top: '50%', duration: DROP, ease: 'power2.inOut' },
                at
              );
            }

            if (scale) {
              fadeInAt(pigTimeline, scale, at + 0.04, {
                yPercent: 0,
                opacity: 1,
                duration: DROP,
                ease: 'power2.out'
              });
            }
          }

          if (beat.pigs !== prev.pigs && beat.pigs > 0) {
            var cell = cellSize(beat.pigs);

            pigTimeline.set(
              herdBox,
              {
                justifyContent: beat.pigs <= 2 ? 'center' : 'flex-start',
                alignContent: beat.pigs <= 2 ? 'center' : 'flex-start'
              },
              at
            );

            pigTimeline.to(
              herd,
              { width: cell.w, height: cell.h, duration: DROP, ease: 'power2.inOut' },
              at
            );
          }

          var revealAt = beat.pigs !== prev.pigs ? at + DROP : at;

          pigTimeline.to(
            human,
            { opacity: beat.human ? 1 : 0, duration: FIG, ease: 'none' },
            revealAt
          );

          pigTimeline.to(
            op,
            { opacity: beat.human && beat.pigs > 0 ? 1 : 0, duration: FIG, ease: 'none' },
            revealAt
          );

          pigTimeline.to(
            pigSide,
            { opacity: beat.pigs > 0 ? 1 : 0, duration: FIG, ease: 'none' },
            revealAt
          );

          herd.forEach(function (cellEl, idx) {
            pigTimeline.set(cellEl, { display: idx < beat.pigs ? 'flex' : 'none' }, revealAt);

            pigTimeline.to(
              cellEl,
              { opacity: idx < beat.pigs ? 1 : 0, duration: FIG, ease: 'none' },
              revealAt + idx * 0.01
            );
          });

          if (pigCount) {
            pigTimeline.to(
              pigCount,
              { duration: FIG, snap: { innerText: 1 }, innerText: beat.pigs, ease: 'none' },
              revealAt
            );
          }

          if (i === QUOTE_AFTER && quote.length) {
            var transitionStart = at + span - TEXT_FADE;
            var quoteEnd = at + span + QUOTE_HOLD;
            var closingIn = quoteEnd - CLEAR;

            if (txt) {
              fadeOutAt(pigTimeline, txt, transitionStart, {
                opacity: 0,
                duration: CLEAR,
                ease: 'power2.in'
              });
            }

            if (stackWrap) {
              fadeOutAt(pigTimeline, stackWrap, transitionStart, {
                opacity: 0,
                duration: CLEAR,
                ease: 'power2.in'
              });
            }

            if (scale) {
              fadeOutAt(pigTimeline, scale, transitionStart, {
                opacity: 0,
                duration: CLEAR,
                ease: 'power2.in'
              });
            }

            pigTimeline.fromTo(
              quote,
              { opacity: 0, y: 60, xPercent: -50, yPercent: -50 },
              {
                opacity: 1,
                y: 0,
                xPercent: -50,
                yPercent: -50,
                duration: 0.22,
                ease: 'power3.out'
              },
              transitionStart + CLEAR
            );

            fadeOutAt(pigTimeline, quote, closingIn, {
              opacity: 0,
              duration: CLEAR,
              ease: 'power2.in'
            });

            if (stackWrap) {
              pigTimeline.set(stackWrap, { height: '100%', top: '0%' }, closingIn);

              fadeInAt(pigTimeline, stackWrap, closingIn, {
                opacity: 1,
                duration: CLEAR,
                ease: 'power2.out'
              });
            }

            if (closingTxt) {
              fadeInAt(pigTimeline, closingTxt, closingIn, { opacity: 1 });
            }
          }
          at += span;
          if (i === QUOTE_AFTER) {
            at += QUOTE_HOLD;
          }
        });
        pigTimeline.to({}, { duration: 0.3 }, at);
      });
    });
  }

  // CLAUDE
  function initClaudeSection() {
    $$('[data-claude-scene]').forEach(function (sec) {
      var track = $('[data-claude-track]', sec);
      var lines = $$('[data-claude-line]', sec);
      var bits = $('[data-claude-bits]', sec);

      if (!track || !lines.length || !bits) {
        console.warn('Claude section missing:', {
          track: !!track,
          lines: lines.length,
          bits: !!bits
        });

        return;
      }

      var DIM_OPACITY = 0.1;
      var BITS_IN = 0.9;
      var LINE_IN = 0.34;
      var LINE_HOLD = 0.55;
      var FINAL_HOLD = 0.8;

      gsap.context(function () {
        gsap.set(lines, { opacity: DIM_OPACITY, x: 10 });

        gsap.set(bits, {
          autoAlpha: 1,
          clipPath: 'polygon(0% 100%, 100% 82%, 100% 100%, 0% 100%)'
        });

        var claudeTimeline = scrollTimeline(track, 0.5);

        claudeTimeline.to(bits, {
          clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)',
          duration: BITS_IN,
          ease: 'power3.inOut'
        });

        lines.forEach(function (line) {
          fadeInAt(claudeTimeline, line, undefined, {
            opacity: 1,
            x: 0,
            duration: LINE_IN,
            ease: 'power2.out'
          });

          claudeTimeline.to({}, { duration: LINE_HOLD });
        });

        claudeTimeline.to({}, { duration: FINAL_HOLD });
      });
    });
  }

  // TAKE ACTION
  function initTakeAction() {
    var actionScene = $('[data-action-scene]');
    var takeAction = $('[data-take-action]');

    if (!actionScene || !takeAction) {
      return;
    }

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          takeAction.classList.toggle('display-none', entry.isIntersecting);
        });
      },
      { threshold: 0 }
    );

    observer.observe(actionScene);
  }

  // NUKE
  function initNuke() {
    $$('[data-nuke-scene]').forEach(function (sec, index) {
      var nq = gsap.utils.selector(sec);
      var track = nq('[data-nuke-track]')[0];
      var land = nq('[data-nuke="land"]');
      var blast = nq('[data-nuke="blast"]');
      var bits = nq('[data-nuke="bits"]');
      var title = nq('[data-nuke-title]');
      var bodies = nq('[data-nuke-body]');
      var slides = nq('[data-nuke-slide]');

      if (!track) {
        return;
      }

      var BEATS = { land: 0.0, blast: 0.02, bits: 0.06, title: 0.08, slides: 0.12 };
      var DUR = { land: 0.05, blast: 0.05, bits: 0.07, slideMove: 0.03 };
      var CFG = {
        scrub: 0.04,
        landFrom: '100vh',
        blastFrom: '100vh',
        slideStep: 0.07,
        slideFrom: '100vh',
        slideTo: '-100vh',
        endHold: 0.05
      };

      gsap.context(function () {
        var mobile = isMobile();

        gsap.set(land, { y: CFG.landFrom, opacity: 1 });

        gsap.set(blast, { y: CFG.blastFrom, xPercent: -50, opacity: 1 });

        if (mobile) {
          gsap.set(bits, { y: 0, xPercent: -50, opacity: 0, clipPath: 'none' });
        } else {
          gsap.set(bits, {
            y: 0,
            xPercent: -50,
            opacity: 1,
            clipPath: 'polygon(0% 110%, 100% 92%, 100% 110%, 0% 110%)'
          });
        }

        gsap.set(title, { opacity: 0 });

        gsap.set(bodies, { opacity: 0 });

        gsap.set(slides, { y: CFG.slideFrom, yPercent: -50, opacity: 1 });

        var nukeTimeline = scrollTimeline(track, CFG.scrub, { id: 'nuke-main-' + index });

        nukeTimeline.to(land, { y: 0, duration: DUR.land, ease: 'power3.out' }, BEATS.land);

        nukeTimeline.to(blast, { y: 0, duration: DUR.blast, ease: 'power3.out' }, BEATS.blast);

        if (mobile) {
          fadeInAt(nukeTimeline, bits, BEATS.bits, {
            opacity: 1,
            duration: DUR.bits,
            ease: 'none'
          });
        } else {
          nukeTimeline.to(
            bits,
            {
              clipPath: 'polygon(0% -10%, 100% -28%, 100% 110%, 0% 110%)',
              duration: DUR.bits,
              ease: 'power2.inOut'
            },
            BEATS.bits
          );
        }

        fadeInAt(nukeTimeline, title, BEATS.title, { opacity: 1 });

        var lastAt = BEATS.slides;

        slides.forEach(function (slide, i) {
          var at = BEATS.slides + i * CFG.slideStep;
          var last = i === slides.length - 1;
          var body = bodies[i];

          if (body) {
            fadeInAt(nukeTimeline, body, at, {
              opacity: 1,
              duration: DUR.slideMove,
              ease: 'power3.out'
            });
          }

          nukeTimeline.to(slide, { y: 0, duration: DUR.slideMove, ease: 'power3.out' }, at);

          if (!last) {
            var outAt = at + CFG.slideStep;

            nukeTimeline.to(
              slide,
              { y: CFG.slideTo, duration: DUR.slideMove, ease: 'power3.in' },
              outAt
            );

            if (body) {
              fadeOutAt(nukeTimeline, body, outAt, {
                opacity: 0,
                duration: DUR.slideMove,
                ease: 'power3.in'
              });
            }
          }

          lastAt = at;
        });

        nukeTimeline.to({}, { duration: CFG.endHold }, lastAt + DUR.slideMove);
      });
    });
  }

  // MATH
  function initMath() {
    $$('[data-math-scene]').forEach(function (sec) {
      var q = gsap.utils.selector(sec);
      var track = q('[data-math-track]')[0];
      var field = q('[data-dot-field="true"]')[0];
      var caption = q('[data-math-caption]')[0];
      var capHead = q('[data-math-head]')[0];
      var capSub = q('[data-math-sub]')[0];
      var burst = q('[data-math-burst]')[0];
      var end = q('[data-math-end]')[0];

      if (!track || !field || !caption || !capHead || !capSub || !burst || !end) {
        console.warn('Math dots: missing required element.');

        return;
      }

      var DOT_FADED_OPACITY = 0.12;
      var CAP_TOP = '0vh';
      var FIELD_REST = 0;
      var FIELD_IN = 0.12;
      var FIELD_HOLD = 0.08;
      var DOT_SWAP = 0.12;
      var AFTER_SWAP_HOLD = 0.08;
      var END_HOLD = 0;
      var CAPTION_1 = 'People who do not exist yet';
      var SUB_1 = '10⁵⁸ potential future lives';
      var CAPTION_2 = '8,000,000,000';
      var SUB_2 = 'Everyone alive today';
      var mobile = isMobile();
      var COLS = mobile ? 17 : 49;
      var ROWS = 25;
      var DOT_SIZE_MIN = 10;
      var DOT_SIZE_MAX = 14;
      var PULSE_CHANCE = 0.1;
      var PULSE_CHANGE_MIN = 3;
      var PULSE_CHANGE_MAX = 5;
      var PULSE_DURATION_MIN = 1.2;
      var PULSE_DURATION_MAX = 2.4;
      var DOT_COLOR = '#ff684d';

      function random(min, max) {
        return Math.random() * (max - min) + min;
      }

      field.innerHTML = '';

      var centerCol = Math.floor(COLS / 2);
      var centerRow = Math.floor(ROWS / 2);

      for (var i = 0; i < COLS * ROWS; i++) {
        var dot = document.createElement('div');

        dot.className = 'math-dot';

        var col = i % COLS;
        var row = Math.floor(i / COLS);
        var size = random(DOT_SIZE_MIN, DOT_SIZE_MAX);

        dot.style.setProperty('--dot-size', size.toFixed(2) + 'px');

        var inCenterBlock = Math.abs(col - centerCol) <= 1 && Math.abs(row - centerRow) <= 1;
        var exactCenter = col === centerCol && row === centerRow;
        var excludedCorner = col === centerCol - 1 && row === centerRow - 1;
        var fixed = inCenterBlock && !excludedCorner;

        if (exactCenter) {
          dot.classList.add('is-center');
        }

        if (fixed) {
          dot.classList.add('is-fixed');
        } else if (Math.random() < PULSE_CHANCE) {
          dot.classList.add('is-pulsing');

          var change = random(PULSE_CHANGE_MIN, PULSE_CHANGE_MAX);
          var direction = Math.random() < 0.5 ? -1 : 1;
          var targetSize = Math.max(2, size + change * direction);

          dot.style.setProperty('--pulse-scale', (targetSize / size).toFixed(3));

          dot.style.setProperty(
            '--pulse-duration',
            random(PULSE_DURATION_MIN, PULSE_DURATION_MAX).toFixed(2) + 's'
          );

          dot.style.setProperty('--pulse-delay', -random(0, 3).toFixed(2) + 's');
        }

        field.appendChild(dot);
      }

      var normalDots = $$('.math-dot:not(.is-fixed)', field);
      var fixedDots = $$('.math-dot.is-fixed', field);
      var centerDot = $('.math-dot.is-center', field);

      gsap.set(normalDots, { opacity: 1, backgroundColor: DOT_COLOR });

      gsap.set(fixedDots, { opacity: 1, backgroundColor: DOT_COLOR });

      function alignBurst() {
        if (!centerDot || !burst) {
          return;
        }

        var dotRect = centerDot.getBoundingClientRect();
        var parent = burst.offsetParent;

        if (!parent) return;

        var parentRect = parent.getBoundingClientRect();

        gsap.set(burst, {
          left: dotRect.left - parentRect.left + dotRect.width / 2,
          top: dotRect.top - parentRect.top + dotRect.height / 2,
          xPercent: -50,
          yPercent: -50,
          marginTop: 0,
          marginLeft: 0
        });
      }

      requestAnimationFrame(alignBurst);

      window.addEventListener('resize', alignBurst);

      if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(function () {
          alignBurst();

          ScrollTrigger.refresh();
        });
      }

      function makeCaptionLayers(container, oldText, newText) {
        container.innerHTML = '';

        container.style.position = 'relative';

        container.style.overflow = 'hidden';

        var oldLayer = document.createElement('span');
        var newLayer = document.createElement('span');

        oldLayer.textContent = oldText;

        newLayer.textContent = newText;

        oldLayer.style.display = 'block';

        oldLayer.style.position = 'relative';

        newLayer.style.display = 'block';

        newLayer.style.position = 'absolute';

        newLayer.style.top = '0';

        newLayer.style.left = '0';

        newLayer.style.width = '100%';

        newLayer.style.height = 'auto';

        container.appendChild(oldLayer);

        container.appendChild(newLayer);

        return { old: oldLayer, next: newLayer };
      }

      var headLayers = makeCaptionLayers(capHead, CAPTION_1, CAPTION_2);
      var headOldHeight = headLayers.old.offsetHeight;
      var headNewHeight = headLayers.next.scrollHeight;

      gsap.set(capHead, { height: headOldHeight });

      var subLayers = makeCaptionLayers(capSub, SUB_1, SUB_2);
      var headOldHeight = headLayers.old.getBoundingClientRect().height;
      var headNewHeight = headLayers.next.getBoundingClientRect().height;

      gsap.set(capHead, { height: headOldHeight });

      gsap.context(function () {
        gsap.set(field, { opacity: 0, yPercent: 100 });

        gsap.set(caption, { opacity: 1, yPercent: -50 });

        gsap.set([headLayers.old, subLayers.old], { opacity: 1 });

        gsap.set([headLayers.next, subLayers.next], { opacity: 0 });

        gsap.set(burst, {
          opacity: 0,
          scale: 0.005,
          xPercent: -50,
          yPercent: -50,
          marginTop: 0,
          marginLeft: 0
        });

        alignBurst();

        gsap.set(end, { opacity: 0 });

        var mathTimeline = scrollTimeline(track, 0.35);
        var fieldAt = 0.08;

        fadeInAt(mathTimeline, field, fieldAt, {
          opacity: 1,
          yPercent: FIELD_REST,
          duration: FIELD_IN,
          ease: 'power2.out'
        });

        mathTimeline.to(
          caption,
          { top: CAP_TOP, yPercent: 0, duration: 0.18, ease: 'power2.out' },
          fieldAt
        );

        mathTimeline.to(
          capHead,
          { height: headNewHeight, duration: TEXT_FADE, ease: TEXT_EASE },
          swapAt
        );

        var swapAt = fieldAt + FIELD_IN + FIELD_HOLD;

        mathTimeline.to(
          normalDots,
          { opacity: DOT_FADED_OPACITY, duration: DOT_SWAP, ease: 'none' },
          swapAt
        );

        mathTimeline.set(fixedDots, { opacity: 1 }, swapAt);

        mathTimeline.to(
          capHead,
          { height: headNewHeight, duration: TEXT_FADE, ease: TEXT_EASE },
          swapAt
        );

        fadeOutAt(mathTimeline, [headLayers.old, subLayers.old], swapAt, { opacity: 0 });

        fadeInAt(mathTimeline, [headLayers.next, subLayers.next], swapAt, { opacity: 1 });

        var burstAt = swapAt + Math.max(DOT_SWAP, TEXT_FADE) + AFTER_SWAP_HOLD;

        mathTimeline.call(alignBurst, null, burstAt - 0.01);

        mathTimeline.to(burst, { opacity: 1, duration: 0.04 }, burstAt);

        mathTimeline.to(burst, { scale: 1, duration: 0.24, ease: 'power2.in' }, burstAt + 0.02);

        fadeOutAt(mathTimeline, [field, caption], burstAt + 0.14, { opacity: 0 });

        var endAt = burstAt + 0.1;

        fadeInAt(mathTimeline, end, endAt, { opacity: 1 });

        mathTimeline.to({}, { duration: END_HOLD });
      });
    });
  }

  // LIBERTY
  function initLiberty() {
    var scenes = $$('[data-liberty-scene]');
    if (!scenes.length) return;

    window.addEventListener('load', function () {
      document.fonts.ready.then(function () {
        ScrollTrigger.refresh();
      });
    });

    var PRE = 1;
    var BEATS = {
      bandIn: 0,
      textIn: 0.08,
      bg: PRE + 0.5,
      swap: PRE + 0.62,
      bits: PRE + 0.85,
      specks: PRE + 0.75,
      figures: PRE + 1.55,
      hold: PRE + 1.12,
      statueSwap: PRE + 1.1
    };
    var DUR = {
      bandIn: 0.5,
      textIn: 0.35,
      bg: 0.6,
      swap: 0.5,
      bits: 2,
      specks: 0.4,
      figures: 0.75,
      hold: 2
    };
    var CFG = {
      scrub: 0.4,
      bandColor: '#080331',
      figureStagger: 0.08,
      speckCount: 50,
      speckColor: '#d85a30',
      speckStart: 0.35
    };
    var mm = gsap.matchMedia();

    scenes.forEach(function (scene) {
      var q = gsap.utils.selector(scene);

      mm.add(
        { isDesktop: '(min-width: 9px)', motionOk: '(prefers-reduced-motion: no-preference)' },
        function (context) {
          if (!context.conditions.isDesktop) return;

          var motionOk = context.conditions.motionOk;
          var track = q('[data-liberty-track]')[0];
          var bgDark = q('[data-liberty="bg-dark"]');
          var band = q('[data-liberty="band"]');
          var statueLight = q('[data-liberty="light"]');
          var statueDark = q('[data-liberty="dark"]');
          var bits = q('[data-liberty="bits"]');
          var swaps = q('[data-liberty-swap]');
          var figures = q('[data-figure]');
          var host = q('[data-liberty-static]')[0];
          var sticky = q('[data-liberty-sticky]')[0];
          var libertyText = q(
            '[data-liberty-slot-top], [data-liberty-slot-mid], [data-liberty-swap]'
          );

          if (!track) return;

          gsap.set(libertyText, { opacity: 0 });

          var loops = [];

          if (host && motionOk) {
            var flick = gsap.timeline({ paused: true });

            for (var i = 0; i < CFG.speckCount; i++) {
              var sp = document.createElement('span');

              sp.style.cssText =
                'position:absolute;' +
                'display:block;' +
                'background:' +
                CFG.speckColor +
                ';opacity:0;' +
                'will-change:opacity';

              host.appendChild(sp);

              (function (el) {
                function place() {
                  var d = gsap.utils.random(2, 4, 1);

                  gsap.set(el, {
                    width: d,
                    height: d,
                    left: gsap.utils.random(0, 100) + '%',
                    top: gsap.utils.random(0, 100) + '%'
                  });
                }

                place();

                flick.to(
                  el,
                  {
                    opacity: 1,
                    duration: 0.06,
                    repeat: -1,
                    repeatRefresh: true,
                    repeatDelay: gsap.utils.random(0.4, 5),
                    yoyo: true,
                    onRepeat: place
                  },
                  gsap.utils.random(0, 3)
                );
              })(sp);
            }

            loops.push(flick);

            ScrollTrigger.create({
              trigger: track,
              start: 'top top-=' + Math.round(track.offsetHeight * CFG.speckStart),
              end: 'bottom bottom',
              onToggle: function (self) {
                if (self.isActive) {
                  flick.play();
                } else {
                  flick.pause();

                  gsap.set(host.children, { opacity: 0 });
                }
              }
            });
          }

          var libertyTimeline = scrollTimeline(track, CFG.scrub);

          libertyTimeline.to(
            band,
            { height: '32%', duration: DUR.bandIn, ease: 'power2.out' },
            BEATS.bandIn
          );

          fadeInAt(libertyTimeline, libertyText, BEATS.textIn, {
            opacity: 1,
            duration: DUR.textIn,
            ease: 'power2.out'
          });

          swaps.forEach(function (swap) {
            var out = $('[data-word="out"]', swap);
            var inn = $('[data-word="in"]', swap);

            gsap.set(inn, { yPercent: 100, opacity: 0 });

            fadeOutAt(libertyTimeline, out, BEATS.swap, {
              yPercent: -110,
              opacity: 0,
              duration: DUR.swap,
              ease: 'power2.inOut'
            });

            fadeInAt(libertyTimeline, inn, BEATS.swap, {
              yPercent: 0,
              opacity: 1,
              duration: DUR.swap,
              ease: 'power2.inOut'
            });
          });

          fadeInAt(libertyTimeline, bgDark, BEATS.bg, {
            opacity: 1,
            duration: DUR.bg,
            ease: 'none'
          });

          libertyTimeline.to(
            band,
            { backgroundColor: CFG.bandColor, duration: DUR.bg, ease: 'none' },
            BEATS.bg
          );

          libertyTimeline.set(statueDark, { opacity: 1 }, BEATS.statueSwap);

          libertyTimeline.set(statueLight, { opacity: 0 }, BEATS.statueSwap);

          gsap.set(bits, {
            opacity: 1,
            clipPath: 'polygon(-200% 0%, -100% 0%, 0% 100%, -100% 100%)'
          });

          libertyTimeline.to(
            bits,
            {
              clipPath: 'polygon(-100% 0%, 100% 0%, 200% 100%, 0% 100%)',
              duration: DUR.bits,
              ease: 'power2.inOut'
            },
            BEATS.bits
          );

          var CLEAR = BEATS.hold + DUR.hold;

          figures.forEach(function (fig, i) {
            var side = fig.getAttribute('data-figure');

            fadeOutAt(libertyTimeline, fig, CLEAR + i * CFG.figureStagger, {
              x: side === 'left' ? -window.innerWidth : window.innerWidth,
              y: side === 'left' ? 120 : 175,
              opacity: 0,
              duration: DUR.figures,
              ease: 'power2.in'
            });
          });

          fadeOutAt(libertyTimeline, bits, CLEAR, {
            opacity: 0,
            duration: 0.35,
            ease: 'power2.in'
          });

          libertyTimeline.to(
            band,
            { height: '0%', duration: 0.4, ease: 'power2.inOut' },
            CLEAR + 0.1
          );

          fadeOutAt(libertyTimeline, [statueDark, host], CLEAR + 0.1, {
            opacity: 0,
            duration: 0.35,
            ease: 'power2.in'
          });

          fadeOutAt(
            libertyTimeline,
            [q('[data-liberty-swap]'), q('[data-liberty-slot-mid]')],
            CLEAR + 0.1,
            { opacity: 0, duration: 0.35, ease: 'power2.in' }
          );

          var pig = $('[data-pig]');

          if (pig) {
            ScrollTrigger.create({
              trigger: pig,
              start: 'top top',
              onEnter: function () {
                gsap.set(sticky, { opacity: 0 });
              },
              onLeaveBack: function () {
                gsap.set(sticky, { opacity: 1 });
              }
            });
          }

          if (host) {
            fadeInAt(libertyTimeline, host, BEATS.specks, {
              opacity: 1,
              duration: DUR.specks,
              ease: 'none'
            });
          }

          figures.forEach(function (fig, i) {
            var side = fig.getAttribute('data-figure');

            libertyTimeline.fromTo(
              fig,
              {
                x: side === 'left' ? -window.innerWidth : window.innerWidth,
                y: side === 'left' ? 120 : 175,
                opacity: 0
              },
              { x: 0, y: 0, opacity: 1, duration: DUR.figures, ease: 'power2.out' },
              BEATS.figures + i * CFG.figureStagger
            );
          });

          libertyTimeline.to({}, { duration: DUR.hold }, BEATS.hold);

          if (motionOk && figures.length) {
            figures.forEach(function (fig, i) {
              var floatTarget = $('[data-inner-figure="true"]', fig);
              var f = createFloat(floatTarget, MOTION.float, i * 0.4);

              loops.push(f);

              ScrollTrigger.create({
                trigger: track,
                start: 'top bottom',
                end: 'bottom top',
                onToggle: function (self) {
                  self.isActive ? f.play() : f.pause();
                }
              });
            });
          }

          return function () {
            loops.forEach(function (t) {
              t.kill();
            });

            if (host) {
              host.innerHTML = '';
            }
          };
        }
      );
    });
  }

  // IDEOLOGY
  function initIdeology() {
    $$('[data-ideology]').forEach(function (sec) {
      var iq = gsap.utils.selector(sec);
      var track = iq('[data-ideology-track]')[0];
      var title = iq('[data-ideo-title]')[0];
      var subtitle = iq('[data-ideo-subtitle]')[0];
      var body = iq('[data-ideo-body]')[0];
      var paragraph = iq('[data-ideo-paragraph]')[0];
      var list = iq('[data-ideo-list]')[0];
      var quote = iq('[data-ideo-quote]')[0];

      if (!track || !title || !subtitle || !body) {
        return;
      }

      var listItems = list ? $$('li', list) : [];

      gsap.context(function () {
        gsap.set(title, { opacity: 1 });

        gsap.set(subtitle, { opacity: 0 });

        gsap.set(body, { opacity: 1 });

        if (paragraph) {
          gsap.set(paragraph, { opacity: 0 });
        }

        if (listItems.length) {
          gsap.set(listItems, { opacity: 0 });
        }

        if (quote) {
          gsap.set(quote, { opacity: 0 });
        }

        var ideologyTimeline = scrollTimeline(track, 0.4);

        fadeInAt(ideologyTimeline, subtitle, 0.1, { opacity: 1 });

        ideologyTimeline.to({}, { duration: 0.35 }, 0.1 + TEXT_FADE);

        var headingOut = 0.7;

        fadeOutAt(ideologyTimeline, [title, subtitle], headingOut, { opacity: 0 });

        var paragraphIn = headingOut + TEXT_FADE;

        if (paragraph) {
          fadeInAt(ideologyTimeline, paragraph, paragraphIn, { opacity: 1 });
        }

        var listIn = paragraphIn + TEXT_FADE + 0.2;

        if (listItems.length) {
          fadeInAt(ideologyTimeline, listItems, listIn, { opacity: 1, stagger: 0.22 });
        }

        var listEnd = listIn + TEXT_FADE + Math.max(0, (listItems.length - 1) * 0.22);
        var bodyOut = listEnd + 0.4;
        var bodyTargets = [];

        if (paragraph) {
          bodyTargets.push(paragraph);
        }

        if (listItems.length) {
          bodyTargets = bodyTargets.concat(listItems);
        }

        if (bodyTargets.length) {
          fadeOutAt(ideologyTimeline, bodyTargets, bodyOut, { opacity: 0 });
        }

        var quoteIn = bodyOut + TEXT_FADE;

        if (quote) {
          fadeInAt(ideologyTimeline, quote, quoteIn, { opacity: 1 });
        }

        var finalHoldStart = quoteIn + TEXT_FADE;

        ideologyTimeline.to({}, { duration: 0.45 }, finalHoldStart);
      });
    });
  }

  // OPT
  function initOPT() {
    $$('[data-opt-scene]').forEach(function (sec, index) {
      var q = gsap.utils.selector(sec);
      var track = q('[data-opt-track]')[0];
      var intro = q('[data-opt-intro]')[0];
      var introText = q('[data-opt-intro-txt]')[0] || intro;
      var blocks = q('[data-opt-block]');

      if (!track || !intro || !blocks.length) {
        return;
      }

      if (sec.dataset.optInitialized === 'true') {
        console.warn('OPT already initialized — skipping duplicate.', sec);

        return;
      }

      sec.dataset.optInitialized = 'true';

      var INTRO_HOLD = 0.8;
      var CARD_IN = 0.85;
      var CARD_HOLD = 0.55;
      var QUOTE_IN = 0.65;
      var QUOTE_HOLD = 0.95;
      var TEXT_RISE = 24;
      var QUOTE_START = '65vh';
      var TEXT_PUSH = isMobile() ? 0 : '-19vh';
      var CARD_CLIPS = [
        'polygon(0 8%, 100% 3%, 100% 100%, 0 100%)',
        'polygon(0 4%, 100% 9%, 100% 100%, 0 100%)',
        'polygon(0 10%, 100% 5%, 100% 100%, 0 100%)',
        'polygon(0 6%, 100% 2%, 100% 100%, 0 100%)'
      ];

      gsap.context(function () {
        gsap.set(intro, { zIndex: 1 });

        gsap.set(introText, { autoAlpha: 0, y: TEXT_RISE });

        blocks.forEach(function (block, i) {
          var head = $('[data-opt-head]', block);
          var copy = $('[data-opt-copy]', block);
          var quote = $('[data-opt-quote]', block);

          gsap.set(block, {
            zIndex: i + 2,
            yPercent: 100,
            rotation: 0,
            scale: 1,
            clipPath: CARD_CLIPS[i % CARD_CLIPS.length]
          });

          if (head) {
            gsap.set(head, { y: 0 });
          }

          if (copy) {
            gsap.set(copy, { y: 0 });
          }

          if (quote) {
            gsap.set(quote, { y: QUOTE_START, autoAlpha: 0 });
          }
        });

        var optTimeline = scrollTimeline(track, 0.4, {
          id: 'opt-' + index,
          invalidateOnRefresh: true
        });

        fadeInAt(optTimeline, introText, 0, { y: 0 });

        optTimeline.to({}, { duration: INTRO_HOLD });

        blocks.forEach(function (block) {
          var head = $('[data-opt-head]', block);
          var copy = $('[data-opt-copy]', block);
          var quote = $('[data-opt-quote]', block);

          optTimeline.to(block, { yPercent: 0, duration: CARD_IN, ease: 'none' });

          optTimeline.to({}, { duration: CARD_HOLD });

          if (quote) {
            fadeInAt(optTimeline, quote, undefined, {
              y: 0,
              duration: QUOTE_IN,
              ease: 'power3.out'
            });

            var textTargets = [];

            if (head) {
              textTargets.push(head);
            }

            if (copy) {
              textTargets.push(copy);
            }

            if (textTargets.length) {
              optTimeline.to(
                textTargets,
                { y: TEXT_PUSH, duration: QUOTE_IN, ease: 'power3.inOut' },
                '<'
              );
            }
          }

          optTimeline.to({}, { duration: QUOTE_HOLD });
        });

        optTimeline.to({}, { duration: 1.2 });
      });
    });
  }

  // FTX
  function initFTX() {
    $$('.section_ftx').forEach(function (sec, index) {
      var track = $('.ftx_track', sec);
      var camera = $('.ftx_camera', sec);
      var background = $('.ftx_background', sec);
      var face = $('.ftx_face', sec);
      var money = $('.ftx_money', sec);
      var blocks = $$('.ftx_block', sec).slice(0, 5);

      if (!track || !camera || !background || blocks.length < 5) {
        console.warn('FTX missing required elements.', {
          track: !!track,
          camera: !!camera,
          background: !!background,
          face: !!face,
          money: !!money,
          blocks: blocks.length
        });
        return;
      }

      if (sec.dataset.ftxInitialized === 'true') return;
      sec.dataset.ftxInitialized = 'true';

      var INTRO_HOLD = 0.45;
      var BLOCK_HOLD = 0.45;
      var FACE_FADE = 0.35;
      var MONEY_START = '100vh';
      var MONEY_IN = 0.5;
      var ROW_FADE = 0.22;
      var ROW_GAP = 0.07;
      var TYPE_BEFORE = 0.85;
      var TYPE_STRIKE = 0.52;
      var BEFORE_STRIKE_PAUSE = 0.12;
      var STRIKE_DURATION = 0.28;
      var STRIKE_DIM = 0.5;
      var STRIKE_DIM_DURATION = 0.22;
      var AFTER_STRIKE_PAUSE = 0.1;
      var TYPE_AFTER = 0.42;
      var REWRITE_HOLD = 0.65;
      var COUNTER_DURATION = 0.55;
      var FINAL_HOLD = 0.9;
      var FOCUS_SOURCE_X = 67.93;
      var FOCUS_SOURCE_Y = 22.74;
      var FINAL_ZOOM = 3.8;

      gsap.context(function () {
        function getCameraFocus() {
          var cw = camera.clientWidth;
          var ch = camera.clientHeight;
          var iw = background.naturalWidth || 0;
          var ih = background.naturalHeight || 0;

          if (!cw || !ch || !iw || !ih) {
            return { x: FOCUS_SOURCE_X, y: FOCUS_SOURCE_Y };
          }

          var coverScale = Math.max(cw / iw, ch / ih);
          var renderedWidth = iw * coverScale;
          var renderedHeight = ih * coverScale;
          var offsetX = (cw - renderedWidth) / 2;
          var offsetY = (ch - renderedHeight) / 2;
          var focusX = offsetX + renderedWidth * (FOCUS_SOURCE_X / 100);
          var focusY = offsetY + renderedHeight * (FOCUS_SOURCE_Y / 100);

          return { x: (focusX / cw) * 100, y: (focusY / ch) * 100 };
        }

        function applyCameraFocus() {
          var focus = getCameraFocus();
          var mobile = isMobile();

          if (mobile) {
            focus.x = gsap.utils.clamp(15, 85, focus.x);

            focus.y = gsap.utils.clamp(15, 85, focus.y);
          }

          gsap.set(camera, { transformOrigin: focus.x + '% ' + focus.y + '%' });
        }

        var convictionRows = $$('[data-ftx-row], .ftx-row', blocks[2]);
        var rewrite = $('[data-ftx-rewrite], .ftx_rewrite', blocks[3]);
        var beforeEl = rewrite ? $('[data-ftx-type-before], .ftx_rewrite-before', rewrite) : null;
        var strikeEl = rewrite ? $('[data-ftx-type-strike], .ftx_rewrite-strike', rewrite) : null;
        var afterEl = rewrite ? $('[data-ftx-type-after], .ftx_rewrite-after', rewrite) : null;

        function buildCharacters(el) {
          if (!el) return null;

          var original = el.textContent;
          var chars = [];
          var words = [];
          var fragment = document.createDocumentFragment();

          el.textContent = '';

          original.split(/(\s+)/).forEach(function (token) {
            if (!token) return;

            if (/^\s+$/.test(token)) {
              fragment.appendChild(document.createTextNode(token));
              return;
            }

            var word = document.createElement('span');
            word.style.whiteSpace = 'nowrap';

            Array.from(token).forEach(function (letter) {
              var char = document.createElement('span');

              char.textContent = letter;
              char.style.visibility = 'hidden';
              char.style.opacity = '1';

              word.appendChild(char);
              chars.push(char);
            });

            words.push(word);
            fragment.appendChild(word);
          });

          el.appendChild(fragment);

          return { el: el, original: original, chars: chars, words: words };
        }

        var beforeType = buildCharacters(beforeEl);
        var strikeType = buildCharacters(strikeEl);
        var afterType = buildCharacters(afterEl);
        var strikeLayer = null;
        var strikeSegments = [];
        var MAX_STRIKE_LINES = 6;

        function createStrikeLayer() {
          if (!rewrite || !strikeEl || !strikeType) return;

          if (getComputedStyle(rewrite).position === 'static') {
            rewrite.style.position = 'relative';
          }

          strikeLayer = document.createElement('div');

          Object.assign(strikeLayer.style, {
            position: 'absolute',
            inset: '0',
            pointerEvents: 'none',
            overflow: 'visible',
            zIndex: '10'
          });

          rewrite.appendChild(strikeLayer);

          for (var i = 0; i < MAX_STRIKE_LINES; i++) {
            var line = document.createElement('div');

            Object.assign(line.style, {
              position: 'absolute',
              height: '3px',
              backgroundColor: getComputedStyle(strikeEl).color,
              transformOrigin: 'left center',
              pointerEvents: 'none',
              display: 'none'
            });

            strikeLayer.appendChild(line);
            strikeSegments.push(line);
          }

          gsap.set(strikeSegments, { scaleX: 0, opacity: 1 });

          updateStrikeGeometry();
        }

        function getStrikeLines() {
          if (!strikeType || !strikeType.words.length) return [];

          var rects = strikeType.words
            .map(function (word) {
              return word.getBoundingClientRect();
            })
            .filter(function (rect) {
              return rect.width > 0 && rect.height > 0;
            });
          var lines = [];

          rects.forEach(function (rect) {
            var centerY = rect.top + rect.height / 2;
            var existing = lines.find(function (line) {
              return Math.abs(line.centerY - centerY) < 5;
            });

            if (!existing) {
              lines.push({
                left: rect.left,
                right: rect.right,
                top: rect.top,
                bottom: rect.bottom,
                centerY: centerY
              });
            } else {
              existing.left = Math.min(existing.left, rect.left);
              existing.right = Math.max(existing.right, rect.right);
              existing.top = Math.min(existing.top, rect.top);
              existing.bottom = Math.max(existing.bottom, rect.bottom);
            }
          });

          return lines;
        }

        function updateStrikeGeometry() {
          if (!rewrite || !strikeSegments.length) return;

          var parentRect = rewrite.getBoundingClientRect();
          var lines = getStrikeLines();

          strikeSegments.forEach(function (segment, i) {
            var line = lines[i];

            if (!line) {
              segment.style.display = 'none';
              return;
            }

            var lineHeight = line.bottom - line.top;
            var y = line.top - parentRect.top + lineHeight * 0.52;

            segment.style.display = 'block';

            segment.style.left = line.left - parentRect.left + 'px';

            segment.style.top = y - 1.5 + 'px';

            segment.style.width = line.right - line.left + 'px';

            segment.style.backgroundColor = getComputedStyle(strikeEl).color;
          });
        }

        createStrikeLayer();

        var finalRows = $$('[data-ftx-row], .ftx-row', blocks[4]);
        var counters = $$('[data-ftx-count]', blocks[4])
          .map(function (el) {
            var raw = String(el.dataset.ftxCount || '')
              .replace(/,/g, '')
              .trim();
            var target = Number(raw);

            if (!Number.isFinite(target)) {
              console.warn('Bad FTX counter:', el, raw);
              return null;
            }

            var prefix = el.dataset.ftxPrefix || '';
            var suffix = el.dataset.ftxSuffix || '';
            var decimals = raw.includes('.') ? raw.split('.')[1].length : 0;
            var originalText = el.textContent;
            var state = { value: 0 };

            function render() {
              var number;

              if (decimals > 0) {
                number = state.value.toFixed(decimals);
              } else {
                number = Math.round(state.value).toLocaleString();
              }

              el.textContent = prefix + number + suffix;
            }

            render();

            return {
              el: el,
              target: target,
              state: state,
              render: render,
              originalText: originalText
            };
          })
          .filter(Boolean);

        gsap.set(camera, { scale: 1, x: 0, y: 0 });

        applyCameraFocus();

        gsap.set(background, { autoAlpha: 1 });

        if (face) {
          gsap.set(face, { autoAlpha: 0, x: 0, y: 0 });
        }

        if (money) {
          gsap.set(money, { autoAlpha: 1, x: 0, y: MONEY_START });
        }

        blocks.forEach(function (block, i) {
          gsap.set(block, { autoAlpha: i === 0 ? 1 : 0 });
        });

        if (rewrite) {
          gsap.set(rewrite, { autoAlpha: 1 });
        }

        if (convictionRows.length) {
          gsap.set(convictionRows, { autoAlpha: 0, y: 14 });
        }

        if (finalRows.length) {
          gsap.set(finalRows, { autoAlpha: 0, y: 14 });
        }

        var ftxTimeline = scrollTimeline(track, 0.45, {
          id: 'ftx-' + index,
          invalidateOnRefresh: true
        });

        function fadeOutBlock(block, at) {
          if (!block) return at;

          fadeOutAt(ftxTimeline, block, at, { ease: 'power2.in' });

          return at + TEXT_FADE;
        }

        function fadeInBlock(block, at) {
          if (!block) return at;

          fadeInAt(ftxTimeline, block, at);

          return at + TEXT_FADE;
        }

        function transitionBlocks(outgoing, incoming, at) {
          at = fadeOutBlock(outgoing, at);
          at = fadeInBlock(incoming, at);

          return at;
        }

        function revealRows(rows, at) {
          rows.forEach(function (row) {
            fadeInAt(ftxTimeline, row, at, { y: 0, duration: ROW_FADE, ease: 'power2.out' });

            at += ROW_FADE + ROW_GAP;
          });

          return at;
        }

        function typeCharacters(target, duration, at) {
          if (!target || !target.chars.length) {
            return at + duration;
          }

          var step = duration / Math.max(1, target.chars.length - 1);

          target.chars.forEach(function (char, i) {
            ftxTimeline.set(char, { visibility: 'visible' }, at + step * i);
          });

          return at + duration;
        }

        function animateCounter(counter, at) {
          counter.state.value = 0;
          counter.render();

          ftxTimeline.to(
            counter.state,
            {
              value: counter.target,
              duration: COUNTER_DURATION,
              ease: 'power2.out',
              onUpdate: counter.render
            },
            at
          );
        }

        var at = 0;

        at += INTRO_HOLD;

        at = transitionBlocks(blocks[0], blocks[1], at);

        if (face) {
          fadeInAt(ftxTimeline, face, at, { duration: FACE_FADE, ease: 'power2.out' });

          at += FACE_FADE;
        }

        if (money) {
          ftxTimeline.to(money, { y: 0, duration: MONEY_IN, ease: 'power3.out' }, at);
        }

        at += Math.max(BLOCK_HOLD, MONEY_IN);

        at = transitionBlocks(blocks[1], blocks[2], at);

        at += BLOCK_HOLD;

        at = revealRows(convictionRows, at);

        at += BLOCK_HOLD;

        var zoomStart = at;

        at = transitionBlocks(blocks[2], blocks[3], at);

        at = typeCharacters(beforeType, TYPE_BEFORE, at);

        at = typeCharacters(strikeType, TYPE_STRIKE, at);

        at += BEFORE_STRIKE_PAUSE;

        if (strikeSegments.length) {
          ftxTimeline.to(
            strikeSegments,
            { scaleX: 1, duration: STRIKE_DURATION, ease: 'power2.out' },
            at
          );

          at += STRIKE_DURATION;
        }

        if (strikeType && strikeType.chars.length) {
          ftxTimeline.to(
            [...strikeType.chars, ...strikeSegments],
            { opacity: STRIKE_DIM, duration: STRIKE_DIM_DURATION, ease: 'power2.out' },
            at
          );

          at += STRIKE_DIM_DURATION;
        }

        at += AFTER_STRIKE_PAUSE;

        at = typeCharacters(afterType, TYPE_AFTER, at);

        at += REWRITE_HOLD;

        if (money) {
          ftxTimeline.to(
            money,
            { x: '-25vw', y: '20vh', duration: 0.6, ease: 'power2.inOut' },
            at - REWRITE_HOLD
          );
        }

        at = transitionBlocks(blocks[3], blocks[4], at);

        at += BLOCK_HOLD;

        finalRows.forEach(function (row) {
          fadeInAt(ftxTimeline, row, at, { y: 0, duration: ROW_FADE, ease: 'power2.out' });

          at += ROW_FADE;

          var rowCounters = counters.filter(function (counter) {
            return row.contains(counter.el);
          });

          rowCounters.forEach(function (counter) {
            animateCounter(counter, at);
          });

          if (rowCounters.length) {
            at += COUNTER_DURATION;
          }

          at += ROW_GAP;
        });

        var looseCounters = counters.filter(function (counter) {
          return !finalRows.some(function (row) {
            return row.contains(counter.el);
          });
        });

        if (looseCounters.length) {
          looseCounters.forEach(function (counter) {
            animateCounter(counter, at);
          });

          at += COUNTER_DURATION;
        }

        ftxTimeline.to({}, { duration: FINAL_HOLD }, at);

        at += FINAL_HOLD;

        var zoomDuration = ftxTimeline.duration() - zoomStart;

        if (zoomDuration > 0) {
          ftxTimeline.to(
            camera,
            { scale: FINAL_ZOOM, x: 0, y: 0, duration: zoomDuration, ease: 'none' },
            zoomStart
          );
        }

        function refreshGeometry() {
          applyCameraFocus();
          updateStrikeGeometry();
        }

        function onResize() {
          refreshGeometry();
          ScrollTrigger.refresh();
        }

        window.addEventListener('resize', onResize);

        if (document.fonts && document.fonts.ready) {
          document.fonts.ready.then(function () {
            refreshGeometry();
            ScrollTrigger.refresh();
          });
        }

        requestAnimationFrame(function () {
          refreshGeometry();
        });

        return function () {
          window.removeEventListener('resize', onResize);

          if (strikeLayer && strikeLayer.parentNode) {
            strikeLayer.parentNode.removeChild(strikeLayer);
          }

          if (beforeType) {
            beforeType.el.textContent = beforeType.original;
          }

          if (strikeType) {
            strikeType.el.textContent = strikeType.original;
          }

          if (afterType) {
            afterType.el.textContent = afterType.original;
          }

          counters.forEach(function (counter) {
            counter.el.textContent = counter.originalText;
          });
        };
      });
    });
  }

  // ASKELL
  function initAskell() {
    $$('[data-askell-scene]').forEach(function (sec, index) {
      var track = $('[data-askell-track]', sec);
      var introGroup = $('[data-askell-intro-group]', sec);
      var title = $('[data-askell-title]', sec);
      var body = $('[data-askell-body]', sec);
      var person = $('[data-askell-person]', sec);
      var personMedia = person ? $('.askell_person-media', person) : null;
      var innerTitle = $('[data-askell-inner-title]', sec);
      var floats = $$('[data-askell-float]', sec);
      var quotes = $$('[data-askell-quote]', sec);

      if (
        !track ||
        !introGroup ||
        !title ||
        !body ||
        !person ||
        !innerTitle ||
        !floats.length ||
        quotes.length < 3
      ) {
        console.warn('Askell section missing required element.', {
          track: track,
          introGroup: introGroup,
          title: title,
          body: body,
          person: person,
          innerTitle: innerTitle,
          floats: floats.length,
          quotes: quotes.length
        });

        return;
      }

      if (sec.dataset.askellInitialized === 'true') {
        console.warn('Askell already initialized — skipping duplicate.', sec);

        return;
      }

      sec.dataset.askellInitialized = 'true';

      var TEXT_RISE = 24;
      var EMPTY_HOLD = 0.55;
      var TITLE_HOLD = 0.3;
      var BODY_HOLD = 0.9;
      var PERSON_IN = 0.85;
      var FLOAT_IN = 0.45;
      var FLOAT_HOLD = 1.15;
      var FLOAT_OUT = 0.6;
      var QUOTE_HOLD = 1.05;
      var FINAL_HOLD = 1.4;

      gsap.matchMedia().add('(min-width: 9px)', function () {
        gsap.set(introGroup, { y: 0 });

        gsap.set(title, { autoAlpha: 0, y: TEXT_RISE });

        gsap.set(body, { autoAlpha: 0, y: TEXT_RISE });

        gsap.set(person, { y: '110vh' });

        if (personMedia) {
          gsap.set(personMedia, { x: 0, y: 0, rotation: 0 });
        }

        gsap.set(floats, { autoAlpha: 0, y: 0 });

        gsap.set(innerTitle, { autoAlpha: 1 });

        gsap.set(quotes, { autoAlpha: 0 });

        var personFloat = null;

        if (personMedia) {
          personFloat = gsap.to(personMedia, {
            y: -12,
            x: 5,
            rotation: 1.35,
            duration: 3.4,
            ease: 'sine.inOut',
            repeat: -1,
            yoyo: true
          });
        }

        var floatTweens = [];
        var floatMotion = [
          { x: -13, y: -8, rotation: -1.5, duration: 2.3 },
          { x: 10, y: 12, rotation: 1.2, duration: 2.52 },
          { x: -8, y: 14, rotation: -1, duration: 2.74 }
        ];

        floats.forEach(function (float, i) {
          var inner = $('.askell_float-inner', float) || float;
          var motion = floatMotion[i];

          if (!motion) {
            return;
          }

          var tween = gsap.to(inner, {
            x: motion.x,
            y: motion.y,
            rotation: motion.rotation,
            duration: motion.duration,
            ease: 'sine.inOut',
            repeat: -1,
            yoyo: true
          });

          floatTweens.push(tween);
        });

        var askellTimeline = scrollTimeline(track, 0.5, {
          id: 'askell-' + index,
          invalidateOnRefresh: true
        });

        askellTimeline.to({}, { duration: EMPTY_HOLD });

        fadeInAt(askellTimeline, title, undefined, { y: 0 });

        askellTimeline.to({}, { duration: TITLE_HOLD });

        fadeInAt(askellTimeline, body, undefined, { y: 0 });

        askellTimeline.to({}, { duration: BODY_HOLD });

        askellTimeline.to(person, { y: 0, duration: PERSON_IN, ease: 'power3.out' });

        askellTimeline.to(
          introGroup,
          { y: '-115vh', duration: PERSON_IN, ease: 'power3.inOut' },
          '<'
        );

        fadeInAt(askellTimeline, floats, '<+0.35', {
          duration: FLOAT_IN,
          ease: 'power2.out',
          stagger: { each: 0.075 }
        });

        askellTimeline.to({}, { duration: FLOAT_HOLD });

        fadeOutAt(askellTimeline, floats, undefined, {
          y: '-55vh',
          duration: FLOAT_OUT,
          ease: 'power2.in',
          stagger: { each: 0.045 }
        });

        fadeOutAt(askellTimeline, innerTitle);

        fadeInAt(askellTimeline, quotes[0], '<');

        askellTimeline.to({}, { duration: QUOTE_HOLD });

        fadeOutAt(askellTimeline, quotes[0]);

        fadeInAt(askellTimeline, quotes[1], '<');

        askellTimeline.to({}, { duration: QUOTE_HOLD });

        fadeOutAt(askellTimeline, quotes[1]);

        fadeInAt(askellTimeline, quotes[2], '<');

        askellTimeline.to({}, { duration: FINAL_HOLD });

        return function () {
          if (personFloat) {
            personFloat.kill();
          }

          floatTweens.forEach(function (tween) {
            tween.kill();
          });
        };
      });
    });
  }

  // FAMILY
  function initFamily() {
    $$('[data-fam-scene]').forEach(function (sec, index) {
      var q = gsap.utils.selector(sec);
      var track = q('[data-fam-track]')[0];
      var rail = q('[data-fam-rail]')[0];
      var band = q('[data-fam-band]')[0];
      var cards = q('[data-fam-card]');
      var items = q('[data-fam-item]');
      var title = q('[data-fam-title]')[0] || items[0];
      var quote = q('[data-fam-quote]')[0] || items[1];

      if (!track || !rail || !band || !cards.length || !title || !quote) {
        console.warn('Family section missing:', {
          track: track,
          rail: rail,
          band: band,
          cards: cards.length,
          items: items.length,
          title: title,
          quote: quote
        });

        return;
      }

      if (sec.dataset.famInitialized === 'true') {
        console.warn('Family already initialized — skipping duplicate.', sec);

        return;
      }

      sec.dataset.famInitialized = 'true';

      var END_GUTTER = 48;
      var TITLE_AT = 0;
      var QUOTE_AT = 0.04;
      var ROW_DURATION = 0.55;
      var ROW_HOLD = 0.18;
      var HORIZONTAL_DURATION = 2.2;
      var FINAL_HOLD = 0.2;

      gsap.context(function () {
        gsap.set(rail, { x: 0, y: '105vh' });

        gsap.set(band, { y: '105vh' });

        gsap.set(cards, { opacity: 1, scale: 1 });

        gsap.set(q('[data-fam-role]'), { opacity: 1 });

        gsap.set(title, { opacity: 0 });

        gsap.set(quote, { opacity: 0 });

        function getHorizontalEnd() {
          var lastCard = cards[cards.length - 1];

          if (!lastCard) {
            return 0;
          }

          var currentX = parseFloat(gsap.getProperty(rail, 'x')) || 0;
          var rect = lastCard.getBoundingClientRect();
          var lastRightAtZero = rect.right - currentX;
          var desiredRight = window.innerWidth - END_GUTTER;
          var distance = desiredRight - lastRightAtZero;

          return Math.min(0, distance);
        }

        var familyTimeline = scrollTimeline(track, 0.4, {
          id: 'family-' + index,
          invalidateOnRefresh: true
        });

        fadeInAt(familyTimeline, title, TITLE_AT, { opacity: 1 });

        fadeInAt(familyTimeline, quote, QUOTE_AT, { opacity: 1 });

        var mobile = isMobile();
        var ROW_AT = QUOTE_AT + TEXT_FADE + 0.08;

        if (mobile) {
          fadeOutAt(familyTimeline, quote, ROW_AT, { opacity: 0 });
        }

        familyTimeline.to(rail, { y: 0, duration: ROW_DURATION, ease: 'power3.out' }, ROW_AT);

        familyTimeline.to(band, { y: 0, duration: ROW_DURATION, ease: 'power3.out' }, ROW_AT);

        familyTimeline.to(rail, { y: 0, duration: ROW_DURATION, ease: 'power3.out' }, ROW_AT);

        familyTimeline.to(band, { y: 0, duration: ROW_DURATION, ease: 'power3.out' }, ROW_AT);

        var HORIZONTAL_AT = ROW_AT + ROW_DURATION + ROW_HOLD;

        familyTimeline.to(
          rail,
          {
            x: function () {
              return getHorizontalEnd();
            },
            duration: HORIZONTAL_DURATION,
            ease: 'none'
          },
          HORIZONTAL_AT
        );

        familyTimeline.to({}, { duration: FINAL_HOLD });

        return function () {
          gsap.set(rail, { clearProps: 'transform' });

          gsap.set(band, { clearProps: 'transform' });
        };
      });
    });
  }

  // SCANDALS
  function initScandals() {
    $$('[data-scandal-scene]').forEach(function (sec) {
      var cards = $$('[data-scandal-card]', sec);
      var scandalsGrid = $('.scandals_grid', sec);
      var reader = $('[data-scandal-reader]', sec);
      var readerVisual = reader?.querySelector('.scandal_reader-visual');
      var readerContent = reader?.querySelector('.scandal_reader-content');
      var readerScroll = reader?.querySelector('.scandal_reader-scroll');
      var readerImage = reader?.querySelector('[data-scandal-reader-image]');
      var closeBtn = reader?.querySelector('[data-scandal-close]');
      var prevBtn = reader?.querySelector('[data-scandal-prev]');
      var nextBtn = reader?.querySelector('[data-scandal-next]');
      var stories = reader ? $$('[data-scandal-story]', reader) : [];
      var intro = $('[data-scandal-intro]', sec);
      var introTrack = $('[data-scandal-track]', sec);

      if (
        !cards.length ||
        !scandalsGrid ||
        !reader ||
        !readerVisual ||
        !readerContent ||
        !readerImage ||
        !closeBtn ||
        !stories.length
      ) {
        console.warn('Scandals: missing required elements.', {
          cards: cards.length,
          scandalsGrid: !!scandalsGrid,
          reader: !!reader,
          readerVisual: !!readerVisual,
          readerContent: !!readerContent,
          readerImage: !!readerImage,
          closeBtn: !!closeBtn,
          stories: stories.length
        });

        return;
      }

      var OPEN_DURATION = 0.72;
      var OPEN_EASE = 'power4.inOut';
      var SWAP_OUT_DURATION = 0.18;
      var SWAP_IN_DURATION = 0.22;
      var currentCard = null;
      var currentStory = null;
      var currentIndex = -1;
      var isOpen = false;
      var isAnimating = false;
      var openGeometry = null;
      var gridGhost = null;
      var oldBodyOverflow = '';
      var oldHtmlOverflow = '';

      gsap.set(reader, {
        position: 'fixed',
        inset: 0,
        width: '100vw',
        height: '100vh',
        margin: 0,
        backgroundColor: 'transparent',
        zIndex: 9990
      });

      reader.setAttribute('aria-hidden', 'true');

      gsap.set(reader, { autoAlpha: 0, pointerEvents: 'none' });

      gsap.set(stories, { display: 'none' });

      if (intro && introTrack) {
        gsap.to(intro, {
          autoAlpha: 0,
          ease: 'none',
          scrollTrigger: { trigger: introTrack, start: 'top top', end: '+=1000', scrub: true }
        });
      }

      cards.forEach(function (card) {
        card.setAttribute('role', 'button');

        card.setAttribute('tabindex', '0');
      });

      function getStoryForCard(card) {
        var id = card.getAttribute('data-story');

        return stories.find(function (story) {
          return story.getAttribute('data-scandal-story') === id;
        });
      }

      function getCardImage(card) {
        return $('[data-scandal-image]', card);
      }

      function setReaderImage(card) {
        var source = getCardImage(card);

        if (!source) {
          return;
        }

        var src = source.currentSrc || source.src;

        if (src) {
          readerImage.src = src;
        }

        readerImage.alt = source.alt || '';

        var styles = getComputedStyle(source);

        readerImage.style.objectPosition = styles.objectPosition;
      }

      function activateStory(story) {
        stories.forEach(function (item) {
          item.classList.remove('is-active');

          gsap.set(item, { display: 'none' });
        });

        story.classList.add('is-active');

        gsap.set(story, { display: 'block' });
      }

      function lockPage() {
        oldBodyOverflow = document.body.style.overflow;

        oldHtmlOverflow = document.documentElement.style.overflow;

        document.body.style.overflow = 'hidden';

        document.documentElement.style.overflow = 'hidden';
      }

      function unlockPage() {
        document.body.style.overflow = oldBodyOverflow;

        document.documentElement.style.overflow = oldHtmlOverflow;
      }

      function createGridGhost() {
        removeGridGhost();

        var rect = scandalsGrid.getBoundingClientRect();

        gridGhost = scandalsGrid.cloneNode(true);

        gridGhost.setAttribute('aria-hidden', 'true');

        gridGhost.setAttribute('data-scandal-grid-ghost', 'true');

        if (gridGhost.id) {
          gridGhost.removeAttribute('id');
        }

        gridGhost.querySelectorAll('[id]').forEach(function (el) {
          el.removeAttribute('id');
        });

        gridGhost.querySelectorAll('*').forEach(function (el) {
          el.style.pointerEvents = 'none';
        });

        Object.assign(gridGhost.style, {
          position: 'fixed',
          left: rect.left + 'px',
          top: rect.top + 'px',
          width: rect.width + 'px',
          height: rect.height + 'px',
          margin: '0',
          zIndex: '9980',
          pointerEvents: 'none',
          opacity: '1',
          visibility: 'visible',
          transform: 'none'
        });

        document.body.appendChild(gridGhost);
      }

      function removeGridGhost() {
        if (!gridGhost) {
          return;
        }

        gridGhost.remove();

        gridGhost = null;
      }

      function createTransitionImage(source, rect) {
        if (!source) {
          return null;
        }

        var styles = getComputedStyle(source);
        var clone = document.createElement('img');

        clone.src = source.currentSrc || source.src;

        clone.alt = '';

        Object.assign(clone.style, {
          position: 'fixed',
          left: rect.left + 'px',
          top: rect.top + 'px',
          width: rect.width + 'px',
          height: rect.height + 'px',
          objectFit: 'cover',
          objectPosition: styles.objectPosition,
          margin: '0',
          padding: '0',
          border: '0',
          maxWidth: 'none',
          maxHeight: 'none',
          pointerEvents: 'none',
          zIndex: '99999',
          transform: 'none',
          willChange: 'left,width'
        });

        document.body.appendChild(clone);

        return clone;
      }

      function clearReaderGeometry() {
        gsap.set(readerVisual, {
          clearProps: 'position,left,top,right,bottom,width,height,margin,transform,overflow'
        });

        gsap.set(readerContent, {
          clearProps: 'position,left,top,right,bottom,width,height,margin,transform,overflow'
        });

        if (readerScroll) {
          gsap.set(readerScroll, { clearProps: 'width,height,minWidth' });
        }
      }

      function openStory(card) {
        if (isOpen || isAnimating) {
          return;
        }

        var story = getStoryForCard(card);
        var sourceImage = getCardImage(card);

        if (!story || !sourceImage) {
          return;
        }

        isAnimating = true;

        currentCard = card;

        currentStory = story;

        currentIndex = cards.indexOf(card);

        var sourceRect = sourceImage.getBoundingClientRect();
        var mobile = isMobile();

        createGridGhost();

        setReaderImage(card);

        activateStory(story);

        if (readerScroll) {
          readerScroll.scrollTop = 0;
        }

        reader.classList.add('is-open');

        reader.setAttribute('aria-hidden', 'false');

        gsap.set(reader, { autoAlpha: 1, pointerEvents: 'auto', backgroundColor: 'transparent' });

        var designerVisualRect = readerVisual.getBoundingClientRect();
        var designerContentRect = readerContent.getBoundingClientRect();
        var geometry = {
          sourceLeft: sourceRect.left,
          sourceRight: sourceRect.right,
          sourceTop: sourceRect.top,
          sourceBottom: sourceRect.bottom,
          sourceWidth: sourceRect.width,
          sourceHeight: sourceRect.height,
          imageLeft: designerVisualRect.left,
          imageTop: designerVisualRect.top,
          imageWidth: designerVisualRect.width,
          imageHeight: designerVisualRect.height,
          contentLeft: designerContentRect.left,
          contentTop: designerContentRect.top,
          contentWidth: designerContentRect.width,
          contentHeight: designerContentRect.height
        };

        openGeometry = geometry;

        var transitionImage = createTransitionImage(sourceImage, sourceRect);

        if (!transitionImage) {
          removeGridGhost();

          isAnimating = false;

          return;
        }

        gsap.set(readerVisual, {
          position: 'fixed',
          left: geometry.imageLeft,
          top: geometry.imageTop,
          width: geometry.imageWidth,
          height: geometry.imageHeight,
          margin: 0,
          x: 0,
          y: 0,
          xPercent: 0,
          yPercent: 0,
          autoAlpha: 0,
          overflow: 'hidden'
        });

        if (mobile) {
          gsap.set(readerContent, {
            position: 'fixed',
            left: geometry.contentLeft,
            top: geometry.sourceBottom,
            width: geometry.contentWidth,
            height: 0,
            margin: 0,
            x: 0,
            y: 0,
            xPercent: 0,
            yPercent: 0,
            overflow: 'hidden'
          });
        } else {
          gsap.set(readerContent, {
            position: 'fixed',
            left: geometry.sourceRight,
            top: geometry.contentTop,
            width: 0,
            height: geometry.contentHeight,
            margin: 0,
            x: 0,
            y: 0,
            xPercent: 0,
            yPercent: 0,
            overflow: 'hidden'
          });
        }

        if (readerScroll) {
          gsap.set(readerScroll, {
            width: geometry.contentWidth,
            minWidth: geometry.contentWidth,
            height: '100%'
          });
        }

        gsap.set(currentStory, { autoAlpha: 0, x: 0, y: 0 });

        gsap.set(closeBtn, { autoAlpha: 0, scale: 0.9 });

        lockPage();

        var tl = gsap.timeline({
          onComplete: function () {
            gsap.set(readerVisual, { autoAlpha: 1 });

            transitionImage.remove();

            isOpen = true;

            isAnimating = false;
          }
        });

        tl.to(
          transitionImage,
          {
            left: geometry.imageLeft,
            top: geometry.imageTop,
            width: geometry.imageWidth,
            height: geometry.imageHeight,
            duration: OPEN_DURATION,
            ease: OPEN_EASE
          },
          0
        );

        if (mobile) {
          tl.to(
            readerContent,
            {
              top: geometry.contentTop,
              height: geometry.contentHeight,
              duration: OPEN_DURATION,
              ease: OPEN_EASE
            },
            0
          );
        } else {
          tl.to(
            readerContent,
            {
              left: geometry.contentLeft,
              width: geometry.contentWidth,
              duration: OPEN_DURATION,
              ease: OPEN_EASE
            },
            0
          );
        }

        fadeInAt(tl, currentStory, 0.42, { duration: 0.25, ease: 'power2.out' });

        fadeInAt(tl, closeBtn, 0.48, { scale: 1, duration: 0.22, ease: 'power2.out' });
      }

      function closeStory() {
        var mobile = isMobile();

        if (!isOpen || isAnimating || !currentCard || !openGeometry) {
          return;
        }

        isAnimating = true;

        var geometry = openGeometry;
        var finalRect = {
          left: geometry.imageLeft,
          top: geometry.imageTop,
          width: geometry.imageWidth,
          height: geometry.imageHeight
        };
        var transitionImage = createTransitionImage(readerImage, finalRect);

        if (!transitionImage) {
          isAnimating = false;

          return;
        }

        gsap.set(readerVisual, { autoAlpha: 0 });

        gsap.set(readerContent, {
          left: geometry.contentLeft,
          top: geometry.contentTop,
          width: geometry.contentWidth,
          height: geometry.contentHeight
        });

        var tl = gsap.timeline({
          onComplete: function () {
            transitionImage.remove();

            reader.classList.remove('is-open');

            reader.setAttribute('aria-hidden', 'true');

            gsap.set(reader, { autoAlpha: 0, pointerEvents: 'none' });

            removeGridGhost();

            clearReaderGeometry();

            gsap.set(readerVisual, { autoAlpha: 1 });

            if (currentStory) {
              currentStory.classList.remove('is-active');

              gsap.set(currentStory, {
                display: 'none',
                clearProps: 'opacity,visibility,transform'
              });
            }

            if (readerScroll) {
              readerScroll.scrollTop = 0;
            }

            unlockPage();

            isOpen = false;

            isAnimating = false;

            currentCard = null;

            currentStory = null;

            currentIndex = -1;

            openGeometry = null;
          }
        });

        fadeOutAt(tl, currentStory, 0, { duration: 0.2, ease: 'power2.in' });

        fadeOutAt(tl, closeBtn, 0, { scale: 0.9, duration: 0.2, ease: 'power2.in' });

        if (mobile) {
          tl.to(
            transitionImage,
            {
              top: geometry.imageTop + geometry.imageHeight,
              height: 0,
              duration: OPEN_DURATION,
              ease: OPEN_EASE
            },
            0
          );
        } else {
          tl.to(
            transitionImage,
            {
              left: geometry.sourceLeft,
              width: geometry.sourceWidth,
              duration: OPEN_DURATION,
              ease: OPEN_EASE
            },
            0
          );
        }

        if (mobile) {
          tl.to(readerContent, { height: 0, duration: OPEN_DURATION, ease: OPEN_EASE }, 0);
        } else {
          tl.to(
            readerContent,
            { left: geometry.sourceRight, width: 0, duration: OPEN_DURATION, ease: OPEN_EASE },
            0
          );
        }
      }

      function goToStory(index) {
        if (!isOpen || isAnimating) {
          return;
        }

        if (index < 0) {
          index = cards.length - 1;
        }

        if (index >= cards.length) {
          index = 0;
        }

        if (index === currentIndex) {
          return;
        }

        var nextCard = cards[index];
        var nextStory = getStoryForCard(nextCard);

        if (!nextStory) {
          return;
        }

        isAnimating = true;

        var oldStory = currentStory;
        var nextSource = getCardImage(nextCard);

        if (!nextSource) {
          isAnimating = false;

          return;
        }

        var nextSrc = nextSource.currentSrc || nextSource.src;
        var nextStyles = getComputedStyle(nextSource);
        var tl = gsap.timeline({
          onComplete: function () {
            currentIndex = index;

            currentCard = nextCard;

            currentStory = nextStory;

            isAnimating = false;
          }
        });

        fadeOutAt(tl, oldStory, undefined, { duration: 0.18, ease: 'power1.out' });

        tl.call(function () {
          if (nextSrc) {
            readerImage.src = nextSrc;
          }

          readerImage.alt = nextSource.alt || '';

          readerImage.style.objectPosition = nextStyles.objectPosition;

          gsap.set(readerImage, { autoAlpha: 1, x: 0, y: 0, scale: 1 });

          oldStory.classList.remove('is-active');

          gsap.set(oldStory, { display: 'none' });

          activateStory(nextStory);

          gsap.set(nextStory, { autoAlpha: 0, x: 0, y: 0, scale: 1 });

          if (readerScroll) {
            readerScroll.scrollTop = 0;
          }
        });

        fadeInAt(tl, nextStory, undefined, { duration: 0.22, ease: 'power1.out' });
      }

      cards.forEach(function (card) {
        card.addEventListener('click', function (event) {
          event.preventDefault();

          openStory(card);
        });

        card.addEventListener('keydown', function (event) {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();

            openStory(card);
          }
        });
      });

      closeBtn.addEventListener('click', function (event) {
        event.preventDefault();

        closeStory();
      });

      if (prevBtn) {
        prevBtn.addEventListener('click', function (event) {
          event.preventDefault();

          goToStory(currentIndex - 1);
        });

        prevBtn.addEventListener('keydown', function (event) {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();

            prevBtn.click();
          }
        });
      }

      if (nextBtn) {
        nextBtn.addEventListener('click', function (event) {
          event.preventDefault();

          goToStory(currentIndex + 1);
        });

        nextBtn.addEventListener('keydown', function (event) {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();

            nextBtn.click();
          }
        });
      }

      document.addEventListener('keydown', function (event) {
        if (event.key === 'Escape' && isOpen) {
          closeStory();
        }
      });
    });
  }

  // WASHINGTON
  function initWashington() {
    $$('[data-wash-scene]').forEach(function (sec) {
      var q = gsap.utils.selector(sec);
      var track = q('[data-wash-track]')[0];
      var claude = q('[data-wash-claude]')[0];
      var capitol = q('[data-wash-capitol]')[0];
      var bills = q('[data-wash-bill]');
      var intro = q('[data-wash-intro]')[0];
      var title = q('[data-wash-title]')[0];
      var counter = q('[data-wash-counter]')[0];
      var counterValue = q('[data-wash-counter-value]')[0];
      var counterLabel = q('[data-wash-counter-label]')[0];
      var scaleGroup = q('[data-wash-scale]')[0];
      var scalePrimary = q('[data-wash-scale-primary]')[0];
      var scaleSecondary = q('[data-wash-scale-secondary]')[0];
      var question = q('[data-wash-question]')[0];
      var fellows = q('[data-wash-stat="fellows"]')[0];
      var pac = q('[data-wash-stat="pac"]')[0];
      var pledged = q('[data-wash-stat="pledged"]')[0];

      if (
        !track ||
        !intro ||
        !title ||
        !counter ||
        !counterValue ||
        !counterLabel ||
        !scalePrimary ||
        !scaleSecondary ||
        !question ||
        !fellows ||
        !pac ||
        !pledged
      ) {
        console.warn('Washington section: missing required elements.');

        return;
      }

      var COUNTER_CENTER_LEFT = '50%';
      var COUNTER_CENTER_TOP = '42%';
      var DESKTOP_COUNTER_TOP = '8%';
      var MOBILE_COUNTER_TOP = '5%';
      var COUNTER_LARGE_VALUE_SIZE = '10rem';
      var DESKTOP_COUNTER_SMALL_VALUE_SIZE = '6rem';
      var MOBILE_COUNTER_SMALL_VALUE_SIZE = '3rem';
      var DESKTOP_LABEL_SIZE = '1.25rem';
      var MOBILE_LABEL_LARGE_SIZE = '1.25rem';
      var MOBILE_LABEL_SMALL_SIZE = '1rem';
      var RATE_PER_SECOND = 32;
      var pageOpenedAt = performance.now();

      function updateCounter() {
        var elapsedSeconds = Math.floor((performance.now() - pageOpenedAt) / 1000);
        var amount = elapsedSeconds * RATE_PER_SECOND;

        counterValue.textContent = '$' + amount.toLocaleString('en-US');
      }

      updateCounter();

      var counterInterval = setInterval(updateCounter, 100);

      gsap.context(function () {
        var mobile = isMobile();
        var counterSmallTop = mobile ? MOBILE_COUNTER_TOP : DESKTOP_COUNTER_TOP;
        var counterSmallValueSize = mobile
          ? MOBILE_COUNTER_SMALL_VALUE_SIZE
          : DESKTOP_COUNTER_SMALL_VALUE_SIZE;
        var counterLargeLabelSize = mobile ? MOBILE_LABEL_LARGE_SIZE : DESKTOP_LABEL_SIZE;
        var counterSmallLabelSize = mobile ? MOBILE_LABEL_SMALL_SIZE : DESKTOP_LABEL_SIZE;
        var counterTextAlign = mobile ? 'center' : 'left';
        var WASHINGTON_TEXT_FADE = 0.34;
        var INTRO_HOLD = 0.55;
        var COUNTER_IN = 0.55;
        var COUNTER_HOLD = 0.85;
        var VISUAL_IN = 0.75;
        var VISUAL_HOLD = 0.65;
        var SCALE_HOLD = 1.25;
        var QUESTION_HOLD = 0.8;
        var STAT_IN = 0.45;
        var STAT_HOLD = 0.9;
        var FINAL_HOLD = 1.4;

        function getComparisonLeft() {
          if (mobile) {
            return '50%';
          }

          var scaleRect = scalePrimary.getBoundingClientRect();
          var counterParent = counter.offsetParent;

          if (!counterParent) {
            return scaleRect.left + 'px';
          }

          var parentRect = counterParent.getBoundingClientRect();

          return scaleRect.left - parentRect.left + 'px';
        }

        gsap.set(title, { autoAlpha: 0 });

        gsap.set(counter, {
          autoAlpha: 0,
          left: COUNTER_CENTER_LEFT,
          top: COUNTER_CENTER_TOP,
          x: 0,
          y: 0,
          xPercent: -50,
          yPercent: -50
        });

        gsap.set(counterValue, { fontSize: COUNTER_LARGE_VALUE_SIZE });

        gsap.set(counterLabel, { fontSize: counterLargeLabelSize, textAlign: counterTextAlign });

        if (capitol) {
          gsap.set(capitol, { yPercent: 100, autoAlpha: 0 });
        }

        if (claude) {
          gsap.set(claude, { autoAlpha: 0, scale: 0.72, rotation: -8 });
        }

        bills.forEach(function (bill, i) {
          var rotations = [-16, 13, -8];
          var xs = [-70, 45, 80];

          gsap.set(bill, {
            autoAlpha: 0,
            y: '-40vh',
            x: xs[i % xs.length],
            rotation: rotations[i % rotations.length]
          });
        });

        if (scaleGroup) {
          gsap.set(scaleGroup, { autoAlpha: 1 });
        }

        gsap.set(scalePrimary, { autoAlpha: 0, y: 35 });

        gsap.set(scaleSecondary, { autoAlpha: 0, y: 35 });

        gsap.set(question, { autoAlpha: 0 });

        gsap.set([fellows, pac, pledged], { autoAlpha: 0, y: 45 });

        var floatTweens = [];

        bills.forEach(function (bill, i) {
          var img = $('img', bill);

          if (!img) {
            return;
          }

          var tween = gsap.to(img, {
            x: i % 2 === 0 ? 8 : -8,
            y: -10 - i * 2,
            rotation: i % 2 === 0 ? 2 : -2,
            duration: 2.8 + i * 0.35,
            ease: 'sine.inOut',
            repeat: -1,
            yoyo: true
          });

          floatTweens.push(tween);
        });

        var tl = scrollTimeline(track, 0.55, { invalidateOnRefresh: true });

        fadeInAt(tl, title, undefined, { duration: WASHINGTON_TEXT_FADE, ease: 'power2.out' });

        tl.to({}, { duration: INTRO_HOLD });

        fadeOutAt(tl, intro, undefined, { y: '-18vh', duration: 0.5, ease: 'power3.in' });

        fadeInAt(tl, counter, '<0.15', { duration: COUNTER_IN, ease: 'power3.out' });

        tl.to({}, { duration: COUNTER_HOLD });

        if (capitol) {
          fadeInAt(tl, capitol, undefined, {
            yPercent: 0,
            duration: VISUAL_IN,
            ease: 'power3.out'
          });
        }

        bills.forEach(function (bill, i) {
          fadeInAt(tl, bill, capitol ? '<' + (0.08 + i * 0.09) : '<' + i * 0.09, {
            y: 0,
            x: 0,
            rotation: 0,
            duration: 0.65,
            ease: 'power3.out'
          });
        });

        if (claude) {
          fadeInAt(tl, claude, '<0.18', {
            scale: 1,
            rotation: 0,
            duration: 0.6,
            ease: 'power3.out'
          });
        }

        tl.to({}, { duration: VISUAL_HOLD });

        tl.to(counter, {
          left: getComparisonLeft,
          top: counterSmallTop,
          xPercent: mobile ? -50 : 0,
          yPercent: 0,
          duration: 0.72,
          ease: 'power4.inOut'
        });

        tl.to(
          counterValue,
          { fontSize: counterSmallValueSize, duration: 0.72, ease: 'power4.inOut' },

          '<'
        );

        tl.to(
          counterLabel,
          { fontSize: counterSmallLabelSize, duration: 0.72, ease: 'power4.inOut' },

          '<'
        );

        fadeInAt(tl, scalePrimary, '<0.25', { y: 0, duration: 0.55, ease: 'power3.out' });

        fadeInAt(tl, scaleSecondary, '<0.20', { y: 0, duration: 0.48, ease: 'power3.out' });

        tl.to({}, { duration: SCALE_HOLD });

        fadeOutAt(tl, [scalePrimary, scaleSecondary], undefined, {
          y: -30,
          duration: 0.35,
          ease: 'power2.in'
        });

        fadeInAt(tl, question, undefined, { duration: WASHINGTON_TEXT_FADE, ease: 'power2.out' });

        tl.to({}, { duration: QUESTION_HOLD });

        fadeOutAt(tl, question, undefined, { duration: 0.28, ease: 'power2.in' });

        fadeInAt(tl, fellows, undefined, { y: 0, duration: STAT_IN, ease: 'power3.out' });

        tl.to({}, { duration: STAT_HOLD });

        fadeOutAt(tl, fellows, undefined, { y: -40, duration: 0.35, ease: 'power2.in' });

        fadeInAt(tl, pac, undefined, { y: 0, duration: STAT_IN, ease: 'power3.out' });

        tl.to({}, { duration: STAT_HOLD });

        fadeOutAt(tl, pac, undefined, { y: -40, duration: 0.35, ease: 'power2.in' });

        fadeInAt(tl, pledged, undefined, { y: 0, duration: 0.6, ease: 'power4.out' });

        bills.forEach(function (bill, i) {
          tl.to(
            bill,
            { y: 45 + i * 12, x: (i - 1) * 30, duration: 0.65, ease: 'power2.inOut' },

            '<'
          );
        });

        if (claude) {
          tl.to(
            claude,
            { scale: 1.08, duration: 0.55, ease: 'power2.out' },

            '<'
          );
        }

        tl.to({}, { duration: FINAL_HOLD });

        return function () {
          floatTweens.forEach(function (tween) {
            tween.kill();
          });
        };
      });

      window.addEventListener('beforeunload', function () {
        clearInterval(counterInterval);
      });
    });
  }

  // NEWS
  function initNews() {
    $$('[data-news-scene]').forEach(function (sec) {
      var groups = $$('[data-news-group]', sec);
      var sectionTitle = $('.news_eyebrow', sec);

      if (!groups.length) {
        console.warn('News section: no groups found.');
        return;
      }

      if (sectionTitle) {
        gsap.fromTo(
          sectionTitle,
          { autoAlpha: 0 },
          {
            autoAlpha: 1,
            duration: TEXT_FADE,
            ease: TEXT_EASE,
            scrollTrigger: {
              trigger: sectionTitle,
              start: 'top 85%',
              toggleActions: 'play none none reverse'
            }
          }
        );
      }

      groups.forEach(function (group) {
        var title = $('[data-news-title]', group);
        var cards = $$('[data-news-card]', group);
        var images = $$('[data-news-image]', group);

        if (!title || !cards.length) {
          console.warn('News group missing title/cards:', group);

          return;
        }

        gsap.set(title, { autoAlpha: 0 });

        gsap.set(cards, { autoAlpha: 0, y: 55 });

        gsap.set(images, { scale: 0.94 });

        var tl = gsap.timeline({ paused: true });

        fadeInAt(tl, title);

        fadeInAt(tl, cards, '-=0.08', {
          y: 0,
          duration: 0.55,
          stagger: { each: 0.12 },
          ease: 'power3.out'
        });

        if (images.length) {
          tl.to(
            images,
            { scale: 1, duration: 0.65, stagger: { each: 0.12 }, ease: 'power3.out' },

            '<'
          );
        }

        ScrollTrigger.create({
          trigger: group,
          start: 'top 72%',
          onEnter: function () {
            tl.play();
          },
          onLeaveBack: function () {
            tl.reverse();
          }
        });
      });
    });
  }

  // MAP
  function initMapSection() {
    var track = $('[data-map-track]');
    var introText = $('[data-map-intro-text]');
    var visualWrapper = $('[data-map-visual-wrapper]');

    if (!track || !introText || !visualWrapper) {
      console.warn('Map section missing elements.');

      return;
    }

    gsap.context(function () {
      gsap.set(visualWrapper, { autoAlpha: 0 });

      var mapTimeline = scrollTimeline(track, 0.55);

      fadeOutAt(mapTimeline, introText, undefined, { duration: 0.45, ease: 'power2.in' });

      fadeInAt(mapTimeline, visualWrapper, undefined, { duration: 0.55, ease: 'power2.out' });
    });
  }

  function initMapLens() {
    var wrapper = $('[data-map-visual-wrapper]');
    var visual = $('[data-map-visual]');
    var image = visual ? $('img', visual) : null;

    if (!wrapper || !visual || !image) {
      console.warn('Map lens missing elements.', {
        wrapper: !!wrapper,
        visual: !!visual,
        image: !!image
      });

      return;
    }

    var ZOOM = 1.5;
    var DESKTOP_LENS_SIZE = 180;
    var MOBILE_LENS_SIZE = 150;
    var MOBILE_LENS_LIFT = 115;
    var mobileQuery = window.matchMedia('(max-width: 991px)');
    var lens = document.createElement('div');

    lens.className = 'map-lens';

    lens.style.pointerEvents = 'none';

    lens.style.overflow = 'hidden';

    wrapper.appendChild(lens);

    var lensImage = document.createElement('div');

    Object.assign(lensImage.style, {
      position: 'absolute',
      inset: '0',
      width: '100%',
      height: '100%',
      borderRadius: 'inherit',
      backgroundRepeat: 'no-repeat',
      pointerEvents: 'none',
      transformOrigin: '50% 50%'
    });

    lens.appendChild(lensImage);

    function updateSource() {
      var src = image.currentSrc || image.src;

      if (!src) {
        return;
      }

      lensImage.style.backgroundImage = 'url("' + src + '")';
    }

    updateSource();

    if (!image.complete) {
      image.addEventListener('load', updateSource);
    }

    function getImageRotation() {
      var transform = getComputedStyle(image).transform;

      if (!transform || transform === 'none') {
        return 0;
      }

      var values;

      if (transform.startsWith('matrix3d(')) {
        values = transform.slice(9, -1).split(',').map(Number);
      } else if (transform.startsWith('matrix(')) {
        values = transform.slice(7, -1).split(',').map(Number);
      }

      if (!values || values.length < 2) {
        return 0;
      }

      var angle = (Math.atan2(values[1], values[0]) * 180) / Math.PI;

      angle = ((angle % 360) + 360) % 360;

      if (angle < 45 || angle >= 315) {
        return 0;
      }

      if (angle < 135) {
        return 90;
      }

      if (angle < 225) {
        return 180;
      }

      return 270;
    }

    function getImagePoint(clientX, clientY) {
      var rect = image.getBoundingClientRect();

      if (
        clientX < rect.left ||
        clientX > rect.right ||
        clientY < rect.top ||
        clientY > rect.bottom
      ) {
        return null;
      }

      var nx = (clientX - rect.left) / rect.width;
      var ny = (clientY - rect.top) / rect.height;
      var width = image.offsetWidth || rect.width;
      var height = image.offsetHeight || rect.height;
      var rotation = getImageRotation();
      var x;
      var y;

      if (rotation === 0) {
        x = nx * width;

        y = ny * height;
      } else if (rotation === 90) {
        x = ny * width;

        y = (1 - nx) * height;
      } else if (rotation === 180) {
        x = (1 - nx) * width;

        y = (1 - ny) * height;
      } else {
        x = (1 - ny) * width;

        y = nx * height;
      }

      return { x: x, y: y, width: width, height: height, rotation: rotation };
    }

    function updateLens(clientX, clientY, isTouch) {
      var point = getImagePoint(clientX, clientY);

      if (!point) {
        lens.classList.remove('is-visible');

        return;
      }

      var wrapperRect = wrapper.getBoundingClientRect();
      var lensSize = isTouch ? MOBILE_LENS_SIZE : DESKTOP_LENS_SIZE;
      var lensLeft = clientX - wrapperRect.left - lensSize / 2;
      var lensTop = clientY - wrapperRect.top - lensSize / 2;

      if (isTouch) {
        lensTop -= MOBILE_LENS_LIFT;
      }

      lensLeft = Math.max(0, Math.min(wrapperRect.width - lensSize, lensLeft));

      lensTop = Math.max(0, Math.min(wrapperRect.height - lensSize, lensTop));

      lens.style.width = lensSize + 'px';

      lens.style.height = lensSize + 'px';

      lens.style.left = lensLeft + 'px';

      lens.style.top = lensTop + 'px';

      lensImage.style.backgroundSize = point.width * ZOOM + 'px ' + point.height * ZOOM + 'px';

      lensImage.style.backgroundPosition =
        lensSize / 2 - point.x * ZOOM + 'px ' + (lensSize / 2 - point.y * ZOOM) + 'px';

      var rotation = point.rotation;

      if (rotation === 270) {
        lensImage.style.transform = 'rotate(-90deg)';
      } else {
        lensImage.style.transform = 'rotate(' + rotation + 'deg)';
      }

      lens.classList.add('is-visible');
    }

    var pendingPoint = null;
    var rafId = null;

    function queueLensUpdate(x, y, isTouch) {
      pendingPoint = { x: x, y: y, isTouch: isTouch };

      if (rafId) {
        return;
      }

      rafId = requestAnimationFrame(function () {
        rafId = null;

        if (!pendingPoint) {
          return;
        }

        updateLens(pendingPoint.x, pendingPoint.y, pendingPoint.isTouch);

        pendingPoint = null;
      });
    }

    wrapper.addEventListener('mousemove', function (event) {
      if (isMobile()) {
        return;
      }

      queueLensUpdate(event.clientX, event.clientY, false);
    });

    wrapper.addEventListener('mouseleave', function () {
      if (isMobile()) {
        return;
      }

      lens.classList.remove('is-visible');
    });

    wrapper.addEventListener(
      'touchstart',
      function (event) {
        if (!isMobile() || !event.touches.length) {
          return;
        }

        var touch = event.touches[0];

        queueLensUpdate(touch.clientX, touch.clientY, true);
      },
      { passive: true }
    );

    wrapper.addEventListener(
      'touchmove',
      function (event) {
        if (!isMobile() || !event.touches.length) {
          return;
        }

        var touch = event.touches[0];

        queueLensUpdate(touch.clientX, touch.clientY, true);
      },
      { passive: true }
    );

    function hideMobileLens() {
      if (!isMobile()) {
        return;
      }

      lens.classList.remove('is-visible');
    }

    wrapper.addEventListener('touchend', hideMobileLens, { passive: true });

    wrapper.addEventListener('touchcancel', hideMobileLens, { passive: true });

    mobileQuery.addEventListener('change', function () {
      lens.classList.remove('is-visible');
    });
  }

  function initEAmap() {
    initMapSection();
    initMapLens();
  }

  // INITIALIZATION
  function initEA() {
    [
      initScrollProgress,
      initLiberty,
      initMaduroScroll,
      initPig,
      initClaudeSection,
      initTakeAction,
      initNuke,
      initMath,
      initIdeology,
      initOPT,
      initFTX,
      initAskell,
      initFamily,
      initScandals,
      initWashington,
      initNews,
      initEAmap
    ].forEach(function (init) {
      try {
        init();
      } catch (error) {
        setTimeout(function () {
          throw error;
        }, 0);
      }
    });

    requestAnimationFrame(function () {
      ScrollTrigger.refresh();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initEA, { once: true });
  } else {
    initEA();
  }
})();
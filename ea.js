// ============================================================
// EA SITE git log -1 --format=%h
// Loaded via jsDelivr. Do not wrap this file in script tags.
//
// Webflow: Site Settings, Custom code, Before body tag:
//   script src="https://cdn.jsdelivr.net/gh/USER/REPO@HASH/ea.js" defer
//
// Requires GSAP and ScrollTrigger enabled in
// Site Settings, Integrations. SplitText for the ideology block.
//
// House rules for every section in here:
//   - the script owns every opacity. Do not set opacity in
//     the Designer on anything animated.
//   - elements GSAP transforms must have NO transform in
//     the Designer, or the two fight.
//   - track is tall, sticky is viewport-sized, movement
//     happens inside. The page never scrolls sideways.
//   - no yoyo or repeat tweens on a scrubbed timeline. They
//     scrub rather than play. Repeating motion needs its own
//     paused timeline fired by a trigger.
//   - Webflow does not copy custom attributes onto duplicated
//     children. After duplicating any component, check the
//     attribute counts in the console before debugging.
// ============================================================

// GLOBAL ANIMATIONS:

document.addEventListener("DOMContentLoaded", function () {

  const texts = document.querySelectorAll('[data-word-reveal="true"]');

  texts.forEach((text) => {

    const words = text.textContent.trim().split(/\s+/);

    text.innerHTML = words
      .map(word => `
        <span style="display:inline-block; overflow:hidden; vertical-align:bottom;">
          <span class="word-reveal-inner" style="display:inline-block;">
            ${word}
          </span>
        </span>
      `)
      .join(" ");

    const innerWords = text.querySelectorAll(".word-reveal-inner");

    gsap.fromTo(
      innerWords,

      {
        yPercent: 110,
        opacity: 0
      },

      {
        yPercent: 0,
        opacity: 1,

        duration: 0.7,
        stagger: 0.06,

        ease: "power3.out"
      }
    );

  });

});

document.addEventListener("DOMContentLoaded", function () {
  const texts = document.querySelectorAll('[data-char-reveal="true"]');

  texts.forEach((text) => {
    const chars = [...text.textContent];

text.innerHTML = chars.map(char => {
  if (char === " ") return " ";

  return `<span style="display:inline-block;overflow:hidden;"><span class="char-reveal-inner" style="display:inline-block;">${char}</span></span>`;
}).join("");

    const innerChars = text.querySelectorAll(".char-reveal-inner");

    gsap.fromTo(
      innerChars,
      {
        yPercent: 110,
        opacity: 0
      },
      {
        yPercent: 0,
        opacity: 1,
        duration: 0.5,
        stagger: 0.025,
        ease: "power3.out"
      }
    );
  });
});


  document.addEventListener('DOMContentLoaded', function () {
    // ── LIBERTY ─────────────────────────────────────────────
    // Replaces the LIBERTY block in ea.js
    //
    // One scrubbed timeline. liberty_track is 240vh, the sticky
    // pins inside it, and that scroll distance maps onto timeline
    // positions 0 to TOTAL. Timeline units are not seconds: a
    // duration of 0.6 occupies 0.6 out of TOTAL, so about a
    // quarter of the section's scroll.
    //
    // Everything you would want to tune lives in BEATS and DUR
    // below. Nothing else in this file needs editing to change
    // the pacing.

    var scenes = gsap.utils.toArray('[data-liberty-scene]');
    if (!scenes.length) return;

    gsap.registerPlugin(ScrollTrigger);

    window.addEventListener('load', function () {
      document.fonts.ready.then(function () {
        ScrollTrigger.refresh();
      });
    });

    // ══ WHEN THINGS HAPPEN ═══════════════════════════════════
    // timeline positions. raise a number to make that beat
    // start later. nothing here is relative, so moving one
    // does not move the others.
    var PRE = 1;

    var BEATS = {
      bg: PRE + 0.5,
      statueDark: PRE + 0.55,
      swap: PRE + 0.62,
      statueLight: PRE + 0.7,
      bits: PRE + 1,
      specks: PRE + 0.75,
      figures: PRE + 1.55,
      hold: PRE + 1.12,
      statueSwap: PRE + 1.1,
    };

    // ══ HOW LONG THINGS TAKE ═════════════════════════════════
    var DUR = {
      bg: 0.6,
      statueDark: 0.6,
      swap: 0.5,
      statueLight: 0.1, // short: it only has to vanish behind
      // the dark one, which is already there
      bits: 0.75,
      specks: 0.4,
      figures: 0.75,
      hold: 3, // the pause. raise this AND the track
      // height together, or it just speeds up
    };

    // ══ EVERYTHING ELSE ══════════════════════════════════════
    var CFG = {
      scrub: 0.4, // lag between scroll and animation
      bandColor: '#080331',
      figureStagger: 0.08, // second figure starts this much later

      speckCount: 50,
      speckColor: '#d85a30',
      speckStart: 0.35, // fraction of track height where the
      // flicker switches on
      floatX: [-8, 8], // px range of the figure drift
      floatY: [-16, -28], // px range of the figure drift
      floatRot: [-3.2, 3.2],
      floatDur: [2.4, 3.6], // seconds. randomised per figure so
      // they never sync up
    };

    var mm = gsap.matchMedia();

    scenes.forEach(function (scene) {
      var q = gsap.utils.selector(scene);

      mm.add(
        {
          isDesktop: '(min-width: 992px)',
          motionOk: '(prefers-reduced-motion: no-preference)',
        },
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
          var sticky = q("[data-liberty-sticky]")[0];

          if (!track) return;

          // every looping timeline goes in here so the cleanup
          // at the bottom can kill them on a resize
          var loops = [];

          // ══ 1. SPECKS ══════════════════════════════════════
          // 50 spans injected into liberty_fx, each blinking on
          // its own random schedule.
          //
          // This runs on a SEPARATE timeline, not the scrubbed
          // one. repeat and yoyo inside a scrub do not play,
          // they scrub, so scrolling drags them back and forth
          // instead of animating them.
          if (host && motionOk) {
            var flick = gsap.timeline({ paused: true });

            for (var i = 0; i < CFG.speckCount; i++) {
              var sp = document.createElement('span');
              sp.style.cssText = 'position:absolute;display:block;background:' + CFG.speckColor + ';opacity:0;will-change:opacity';
              host.appendChild(sp);

              (function (el) {
                function place() {
                  var d = gsap.utils.random(2, 4, 1);
                  gsap.set(el, {
                    width: d,
                    height: d,
                    left: gsap.utils.random(0, 100) + '%',
                    top: gsap.utils.random(0, 100) + '%',
                  });
                }

                place();

                // repeatRefresh re-rolls the delay every cycle
                // and onRepeat moves the speck, so the pattern
                // never visibly loops
                flick.to(
                  el,
                  {
                    opacity: 1,
                    duration: 0.06,
                    repeat: -1,
                    repeatRefresh: true,
                    repeatDelay: gsap.utils.random(0.4, 5),
                    yoyo: true,
                    onRepeat: place,
                  },
                  gsap.utils.random(0, 3),
                );
              })(sp);
            }

            loops.push(flick);

            // switch the flicker on partway down the track and
            // off again when the section leaves, so it is not
            // burning frames through the rest of the page
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
              },
            });
          }

          // ══ 2. THE MASTER TIMELINE ═════════════════════════
          // scrubbed: its playhead is tied to scroll position
          // rather than to time.
          var tl = gsap.timeline({
            scrollTrigger: {
              trigger: track,
              start: 'top top',
              end: 'bottom bottom',
              scrub: CFG.scrub,
            },
          });

          // ── word swaps ────────────────────────────────────
          // each slot holds two words stacked on top of each
          // other. the incoming one starts at yPercent 100,
          // meaning one full self-height below, hidden by
          // overflow: hidden on the slot.
          //
          // both travel upward, so it reads as one motion
          // rather than two separate fades.
          swaps.forEach(function (swap) {
            var out = swap.querySelector('[data-word="out"]');
            var inn = swap.querySelector('[data-word="in"]');

            gsap.set(inn, { yPercent: 100, opacity: 0 });

            tl.to(
              out,
              {
                yPercent: -110,
                opacity: 0,
                duration: DUR.swap,
                ease: 'power2.inOut',
              },
              BEATS.swap,
            );

            tl.to(
              inn,
              {
                yPercent: 0,
                opacity: 1,
                duration: DUR.swap,
                ease: 'power2.inOut',
              },
              BEATS.swap,
            );
          });

          // ── the background turns ──────────────────────────
          tl.to(
            bgDark,
            {
              opacity: 1,
              duration: DUR.bg,
              ease: 'none',
            },
            BEATS.bg,
          );

          // the band is not fading, its colour is tweening.
          // it has mix-blend-mode multiply, so through the
          // transition it multiplies with whatever is behind it.
          tl.to(
            band,
            {
              backgroundColor: CFG.bandColor,
              duration: DUR.bg,
              ease: 'none',
            },
            BEATS.bg,
          );

          // ── the statue swaps ──────────────────────────────
          // dark comes up first and light leaves after, so the
          // body is covered before the head disappears. without
          // that overlap you see the background through it.
          /*
        tl.to(statueDark, {
          opacity: 1,
          duration: DUR.statueDark,
          ease: "none"
        }, BEATS.statueDark);

        tl.to(statueLight, {
          opacity: 0,
          duration: DUR.statueLight,
          ease: "none"
        }, BEATS.statueLight);
*/

          tl.set(statueDark, { opacity: 1 }, BEATS.statueSwap);
          tl.set(statueLight, { opacity: 0 }, BEATS.statueSwap);
          // ── the corruption arrives ────────────────────────

          gsap.set(bits, {
            yPercent: -100,
            opacity: 0,
          });

          tl.to(
            bits,
            {
              yPercent: 0,
              opacity: 1,
              duration: DUR.bits,
              ease: 'power3.out',
            },
            BEATS.bits,
          );

          // ── the section clears itself ─────────────────────
          // everything except the background fades out, so the
          // liberty frame empties to a flat colour that matches
          // the next section. no visible boundary.
          // ── the section clears ────────────────────────────
          // content fades out first, band included. the
          // background then cuts instantly rather than fading,
          // because the next section already has the identical
          // image behind it and a fade would show as a dip.
                  // ── the section clears ────────────────────────────
        // each element exits the way it entered, reversed.
        // figures fly back out sideways, bits rise back up
        // off the top, the band collapses to nothing, text
        // just fades.
        var CLEAR = BEATS.hold + DUR.hold;

        // figures fly back out the way they came in
        figures.forEach(function (fig, i) {
          var side = fig.getAttribute("data-figure");

          tl.to(fig, {
            x: side === "left"
              ? -window.innerWidth
              : window.innerWidth,
            y: side === "left" ? 120 : 175,
            opacity: 0,
            duration: DUR.figures,
            ease: "power2.in"
          }, CLEAR + i * CFG.figureStagger);
        });

        // bits retreat upward, same path they came down
        tl.to(bits, {
          yPercent: -100,
          opacity: 0,
          duration: DUR.bits,
          ease: "power3.in"
        }, CLEAR);

        // the band collapses to the bottom edge
        tl.to(band, {
          height: "0%",
          duration: 0.40,
          ease: "power2.inOut"
        }, CLEAR + 0.10);

        // statue and specks just fade
        tl.to([statueDark, host], {
          opacity: 0,
          duration: 0.35,
          ease: "power2.in"
        }, CLEAR + 0.10);

        // text fades last, so the words are the final thing
        tl.to([
          q("[data-liberty-swap]"),
          q("[data-liberty-slot-mid]")
        ], {
          opacity: 0,
          duration: 0.35,
          ease: "power2.in"
        }, CLEAR + 0.30);

          // hard cut, no fade. by this point the pig section
          // has covered the frame with the same image.
		        // hide only once pig has covered the frame
        var pig = document.querySelector("[data-pig]");
        if (pig) {
          ScrollTrigger.create({
            trigger: pig,
            start: "top top",
            onEnter: function () {
              gsap.set(sticky, { opacity: 0 });
            },
            onLeaveBack: function () {
              gsap.set(sticky, { opacity: 1 });
            }
          });
        }

          if (host) {
            tl.to(
              host,
              {
                opacity: 1,
                duration: DUR.specks,
                ease: 'none',
              },
              BEATS.specks,
            );
          }

          figures.forEach(function (fig, i) {
            var side = fig.getAttribute('data-figure');

            tl.fromTo(
              fig,
              {
                x: side === 'left' ? -window.innerWidth : window.innerWidth,

                y: side === 'left' ? 120 : 175,

                opacity: 0,
              },
              {
                x: 0,
                y: 0,
                opacity: 1,
                duration: DUR.figures,
                ease: 'power2.out',
              },

              BEATS.figures + i * CFG.figureStagger,
            );
          });

          // ── the hold ──────────────────────────────────────
          // an empty tween on a dummy object. it occupies
          // timeline space and does nothing, which is what
          // gives the finished frame time on screen.
          tl.to({}, { duration: DUR.hold }, BEATS.hold);

          // ══ 3. FIGURE FLOAT ════════════════════════════════
          // separate timeline again, for the same reason as
          // the specks. each figure gets its own random
          // duration and offset so they never move in unison.
          if (motionOk && figures.length) {
            figures.forEach(function (fig, i) {
              var f = gsap.timeline({
                repeat: -1,
                yoyo: true,
                paused: true,
                defaults: { ease: 'sine.inOut' },
              });

              var floatTarget = fig.querySelector('[data-inner-figure="true"]');

              f.to(
                floatTarget,
                {
                  x: gsap.utils.random(CFG.floatX[0], CFG.floatX[1]),
                  y: gsap.utils.random(CFG.floatY[0], CFG.floatY[1]),
                  rotate: gsap.utils.random(CFG.floatRot[0], CFG.floatRot[1]),
                  duration: gsap.utils.random(CFG.floatDur[0], CFG.floatDur[1]),
                },
                i * 0.4,
              );

              loops.push(f);

              ScrollTrigger.create({
                trigger: track,
                start: 'top bottom',
                end: 'bottom top',
                onToggle: function (self) {
                  self.isActive ? f.play() : f.pause();
                },
              });
            });
          }

          // ══ CLEANUP ════════════════════════════════════════
          // runs when the viewport drops below 992px. kills the
          // looping timelines and empties the injected specks
          // so a resize back up does not stack duplicates.
          return function () {
            loops.forEach(function (t) {
              t.kill();
            });
            if (host) host.innerHTML = '';
          };
        },
      );
    });
  });


// ── S03 STACK ───────────────────────────────────────────
// Replaces the S03 block in ea.js
//
// Three lines advance one at a time. Each one arrives at
// full size, then settles at its own smaller scale as the
// next arrives, so the finished stack reads as a hierarchy
// rather than three equal demoted lines.
//
// Designer:
//   section_s03      data-s03
//   s03_track        data-s03-track, position relative, height 300vh
//   s03_sticky       sticky, top 0, height 100svh
//   s03_stack        gap 0, line-height 0.95
//   liberty_s03-line data-s03-line, margin-bottom -0.35em
//                    (negative margin because a scaled-down line
//                     keeps its original line box height, which
//                     is what leaves the gaps)
//   liberty_s03-kicker  data-s03-kicker
//
//   NO opacity values in the Designer. The script owns them.
/*
document.addEventListener("DOMContentLoaded", function () {
  gsap.utils.toArray("[data-s03]").forEach(function (sec) {
    var sq = gsap.utils.selector(sec);

    var track = sq("[data-s03-track]")[0];
    var lines = sq("[data-s03-line]");
    var kicker = sq("[data-s03-kicker]");

    if (!track || !lines.length) return;

    // ── config ────────────────────────────────────────────
    // final scale for each line once it has been demoted.
    // one entry per line, smallest first. the last line
    // never demotes, so its value is unused.
    var SIZES = [0.42, 0.62, 1];

    // final opacity, following the same ramp
    var FADES = [0.5, 0.72, 1];

    var STEP = 0.25;   // scroll distance per line

    gsap.matchMedia().add("(min-width: 992px)", function () {
      gsap.set(lines, { transformOrigin: "left center" });

      var tl = gsap.timeline({
        scrollTrigger: {
          trigger: track,
          start: "top top",
          end: "bottom bottom",
          scrub: 0.4
        }
      });

      lines.forEach(function (line, i) {
        var at = i * STEP;
        var last = i === lines.length - 1;

        // arrives at full size
        tl.fromTo(line,
          { opacity: 0, y: 24, scale: 1 },
          {
            opacity: 1, y: 0,
            duration: 0.18,
            ease: "power2.out"
          },
          at
        );

        // settles at its own size as the next one arrives
        if (!last) {
          tl.to(line, {
            scale: SIZES[i] !== undefined ? SIZES[i] : 0.5,
            opacity: FADES[i] !== undefined ? FADES[i] : 0.6,
            duration: 0.18,
            ease: "power2.inOut"
          }, at + STEP);
        }
      });

      // kicker lands after the last line
      tl.fromTo(kicker,
        { opacity: 0, y: 16 },
        {
          opacity: 1, y: 0,
          duration: 0.18,
          ease: "power2.out"
        },
        lines.length * STEP
      );
    });
  });
});

*/
// ── PIG SCALE ───────────────────────────────────────────
// Replaces the PIG SCALE block in ea.js
//
// Each line gets its own hold time from the HOLDS array, so
// the opening statement can sit far longer than the rest.
// Positions accumulate rather than being i * STEP.
//
// The copy sits centred in the full frame for the first five
// lines. When the figures arrive it slides down to make room
// for them, and stays there.
//
// PACING: total timeline length is the sum of HOLDS. Track
// height must scale with it. Current sum is about 4.3, so:
//   pig_track 1200vh
// If you lengthen a hold, raise the track by the same ratio.
//
// Designer:
//   pig_track     height 1200vh
//   pig_sticky    sticky, top 0, height 100svh, overflow hidden
//
//   pig_scale     position relative, z-index 1, display flex,
//                 align-items center, justify-content center,
//                 gap 4vw, padding 0 5vw
//     pig_side    flex 0 0 26vw on the BASE class, not the
//                 combos, or the two sides differ in width.
//                 flex column, align-items center, gap 2vh
//       pig_stage width 100%, height 46vh, display flex,
//                 align-items center, justify-content center
//                 Same class both sides. This is what makes
//                 the two columns identical, so the counts
//                 below them line up and the = sits on their
//                 shared centre line.
//         pig_fig-img   max-height 100%, width auto, height auto
//         pig_herd      data-pig-herd, display flex,
//                       flex-wrap wrap, align-items center,
//                       align-content center,
//                       justify-content center,
//                       width 100%, height 100%, gap 2%
//       pig_count  text-align center
//     pig_op      align-self center
//
//   padding-global  position ABSOLUTE, inset 0, z-index 1,
//                   width 100%, height 100%
//     container-large  height 100%
//       pig_stack      data-pig-stack, position relative,
//                      height 100%, flex, centered
//         pig_line     data-pig-line, position absolute,
//                      width 100%, text-align center
//           pig_line-txt  data-pig-txt, display block
//
//   NO opacity values anywhere in this section.

// ── PIG SCALE ───────────────────────────────────────────
// Replaces the PIG SCALE block in ea.js
//
// HERD LAYOUT
// pig_herd is a wrapping COLUMN at 100% height. Each pig sits
// in a pig_cell, and only the CELL is ever resized. The image
// inside is max-width 100% / max-height 100% with auto on both
// dimensions, so it fits its cell and never distorts.
//
// Cell WIDTH is the size control. Cell HEIGHT is purely
// structural: it decides how many fit in a column before
// wrapping. Keeping the width constant from 1 to 4 pigs means
// no width tween fires on those steps, so the image can never
// flash bigger than either state mid-transition.
//
// Cells always resize BEFORE new pigs appear. If both ran at
// once you would see a new pig sitting in a row before the
// column width caught up and dropped it into place.
//
// THE ENDING
// The quote arrives on the second to last line, clearing the
// pigs and the copy container so it sits alone in the centre.
// The final line then clears the quote and lands on an empty
// frame with the copy container restored to full height.
//
// PACING: sum of HOLDS divided by 0.0094 gives the track
// height in vh. Current sum is 12.8, so pig_track = 1360vh.
//
// Needs SplitText ticked in Site Settings, Integrations.

document.addEventListener("DOMContentLoaded", function () {
  gsap.utils.toArray("[data-pig]").forEach(function (sec) {
    var pq = gsap.utils.selector(sec);

    var track = pq("[data-pig-track]")[0];
    var stackWrap = pq("[data-stack-wrapper]")[0];
    var scale = pq("[data-pig-scale]")[0];
    var lines = pq("[data-pig-line]");
    var human = pq("[data-pig-human]");
    var op = pq("[data-pig-op]");
    var pigSide = pq("[data-pig-pigside]");
    var herdBox = pq("[data-pig-herd]")[0];
    var pigCount = pq('[data-pig-count="pig"]')[0];
    var quote = pq("[data-pig-quote]");

    if (!track || !lines.length || !herdBox) return;

    var seed = herdBox.querySelector("[data-pig-cell]");
    if (!seed) return;

    var hasSplit = typeof SplitText !== "undefined";
    if (hasSplit) gsap.registerPlugin(SplitText);

    // ── one entry per copy line, in order ─────────────────
    var BEATS = [
      { pigs: 0,  human: false },  //  1  religion of Silicon Valley
      { pigs: 0,  human: false },  //  2  here are its tenets
      { pigs: 0,  human: false },  //  3  Effective:
      { pigs: 0,  human: false },  //  4  Altruism:
      { pigs: 0,  human: false },  //  5  who can argue against
      { pigs: 1,  human: true  },  //  6  what does that look like
      { pigs: 2,  human: true  },  //  7  0.51 math
      { pigs: 2,  human: true  },  //  8  not so fast
      { pigs: 10, human: true  },  //  9  five to ten pigs
      { pigs: 10, human: true  },  // 10  it's logical, quote lands here
    ];

    // ── how long each line holds, in timeline units ───────
    var HOLDS = [
      2.0,   //  1  the opening statement, sits a long time
      1.0,   //  2
      1.0,   //  3
      1.0,   //  4
      1.0,   //  5
      1.0,   //  6
      1.0,   //  7
      1.0,   //  8
      1.0,   //  9
      2.4    // 11  final line, alone on empty
    ];

    // ── cell geometry per pig count ───────────────────────
    // width is the size control and stays constant to 4 pigs,
    // so nothing tweens wider mid-step. height only ever
    // shrinks, and controls how many fit per column.
    function cellSize(n) {
      if (n <= 1) return { w: "75%", h: "75%" };
      if (n === 2) return { w: "75%", h: "50%" };
      if (n <= 4) return { w: "75%", h: "25%" };

      var cols = Math.ceil(n / 4);
      return { w: (75 / cols) + "%", h: "25%" };
    }

    // ── config ────────────────────────────────────────────
    var FADE = 0.14;      // word reveal duration
    var IN_STAG = 0.03;   // gap between words coming in
    var OUT_STAG = 0.02;  // gap between words going out
    var WORD_Y = 40;      // percent of own height travelled
    var FIG = 0.16;       // figure fade duration
    var DROP = 0.34;      // frame split and layout change
    var CLEAR = 0.24;     // how long things take to leave
        var QUOTE_HOLD = 1.6;   // scroll distance the quote owns
    var QUOTE_AFTER = 8;    // it takes over after this line index

    // ── build the herd to 10 cells ────────────────────────
    var HERD_TARGET = 10;
    var existing = herdBox.querySelectorAll("[data-pig-cell]").length;

    for (var p = existing; p < HERD_TARGET; p++) {
      herdBox.appendChild(seed.cloneNode(true));
    }

    var herd = gsap.utils.toArray(
      herdBox.querySelectorAll("[data-pig-cell]")
    );

    gsap.matchMedia().add("(min-width: 992px)", function () {
      // ── starting states ─────────────────────────────────
      gsap.set([human, op, pigSide], { opacity: 0 });
      gsap.set(herd, { opacity: 0, display: "none" });
      gsap.set(quote, { opacity: 0, xPercent: -50, yPercent: -50 });

      // the copy fills the frame, the figures wait below it
      if (stackWrap) {
        gsap.set(stackWrap, { height: "100%", top: "0%", opacity: 1 });
      }
      if (scale) gsap.set(scale, { yPercent: 100, opacity: 0 });

      // column direction plus wrap plus a fixed height is
      // what breaks the herd into columns automatically
      gsap.set(herdBox, {
        flexDirection: "column",
        flexWrap: "wrap",
        height: "100%",
        width: "100%"
      });

      var first = cellSize(1);
      gsap.set(herd, { width: first.w, height: first.h });

      // every SplitText instance, so the cleanup below can
      // put the markup back on a resize
      var splits = [];

      var tl = gsap.timeline({
        scrollTrigger: {
          trigger: track,
          start: "top top",
          end: "bottom bottom",
          scrub: 0.4
        }
      });

      // positions accumulate, so each line can have its own
      // length rather than sharing one fixed step
      var at = 0;

      lines.forEach(function (line, i) {
        var span = HOLDS[i] !== undefined ? HOLDS[i] : 1.0;
        var txt = line.querySelector("[data-pig-txt]");
        var beat = BEATS[i] || BEATS[BEATS.length - 1];
        var prev = i > 0 ? BEATS[i - 1] : { pigs: 0, human: false };
        var last = i === lines.length - 1;
        var quoteBeat = i === lines.length - 2;

        // ── copy: word by word, first to last ────────────
        if (txt && hasSplit) {
          var sp = new SplitText(txt, { type: "words" });
          splits.push(sp);

          gsap.set(txt, { opacity: 1 });
          gsap.set(sp.words, { opacity: 0, yPercent: WORD_Y });

          tl.to(sp.words, {
            opacity: 1,
            yPercent: 0,
            duration: FADE,
            ease: "power2.out",
            stagger: { each: IN_STAG }
          }, at);

          if (!last) {
            tl.to(sp.words, {
              opacity: 0,
              yPercent: -WORD_Y,
              duration: FADE,
              ease: "power2.in",
              stagger: { each: OUT_STAG }
            }, at + span - FADE);
          }
        } else if (txt) {
          // fallback if SplitText is not loaded
          gsap.set(txt, { opacity: 0 });

          tl.to(txt, {
            opacity: 1, duration: FADE, ease: "power1.out"
          }, at);

          if (!last) {
            tl.to(txt, {
              opacity: 0, duration: FADE, ease: "power1.in"
            }, at + span - FADE);
          }
        }

        // ── the frame splits once, as the figures arrive ──
        // the copy container shrinks to the lower half while
        // the figures rise into the space it vacates
        if (beat.pigs > 0 && prev.pigs === 0) {
          if (stackWrap) {
            tl.to(stackWrap, {
              height: "50%",
              top: "50%",
              duration: DROP,
              ease: "power2.inOut"
            }, at);
          }

          if (scale) {
            tl.to(scale, {
              yPercent: 0,
              opacity: 1,
              duration: DROP,
              ease: "power2.out"
            }, at + 0.04);
          }
        }

        // ── cells resize as the count changes ────────────
        if (beat.pigs !== prev.pigs && beat.pigs > 0) {
          var cell = cellSize(beat.pigs);

          // one and two pigs sit centred. three or more
          // anchor top-left so cells shrink in place and new
          // columns extend rightward without the whole group
          // recentring mid-tween, which caused the jump.
          tl.set(herdBox, {
            justifyContent: beat.pigs <= 2 ? "center" : "flex-start",
            alignContent: beat.pigs <= 2 ? "center" : "flex-start"
          }, at);

          tl.to(herd, {
            width: cell.w,
            height: cell.h,
            duration: DROP,
            ease: "power2.inOut"
          }, at);
        }

        // ── the layout finishes before pigs appear ───────
        var revealAt = beat.pigs !== prev.pigs
          ? at + DROP
          : at;

        // ── figures, all on revealAt ─────────────────────
        tl.to(human, {
          opacity: beat.human ? 1 : 0,
          duration: FIG, ease: "none"
        }, revealAt);

        tl.to(op, {
          opacity: beat.human && beat.pigs > 0 ? 1 : 0,
          duration: FIG, ease: "none"
        }, revealAt);

        tl.to(pigSide, {
          opacity: beat.pigs > 0 ? 1 : 0,
          duration: FIG, ease: "none"
        }, revealAt);

        herd.forEach(function (cellEl, idx) {
          tl.set(cellEl, {
            display: idx < beat.pigs ? "flex" : "none"
          }, revealAt);

          tl.to(cellEl, {
            opacity: idx < beat.pigs ? 1 : 0,
            duration: FIG, ease: "none"
          }, revealAt + idx * 0.01);
        });

        if (pigCount) {
          tl.to(pigCount, {
            duration: FIG,
            snap: { innerText: 1 },
            innerText: beat.pigs,
            ease: "none"
          }, revealAt);
        }

        // ── the quote takes the frame ────────────────────
        // fires near the end of the second to last line. the
        // figures and the copy container clear, then the
        // quote drops into the empty centre.


        // ── the quote clears for the final line ──────────
        // the copy container returns to full height and
        // centres, so the last line lands on an empty frame
    

        // ── the quote owns the frame between two lines ───
        // everything clears, the quote lands alone and holds
        // for its own beat, then leaves before the next line
        if (i === QUOTE_AFTER && quote.length) {
          var qStart = at + span;

          // pigs and copy container clear
          tl.to([scale, stackWrap], {
            opacity: 0,
            duration: CLEAR,
            ease: "power2.in"
          }, qStart);

          // quote arrives in the empty centre
          tl.fromTo(quote,
            { opacity: 0, y: 60, rotate: -8, xPercent: -50, yPercent: -50 },
            {
              opacity: 1, y: 0, rotate: -2,
              xPercent: -50, yPercent: -50,
              duration: 0.34, ease: "power3.out"
            },
            qStart + CLEAR + 0.10
          );

          // it holds, then leaves
          tl.to(quote, {
            opacity: 0,
            duration: CLEAR,
            ease: "power2.in"
          }, qStart + QUOTE_HOLD - CLEAR);

          // the copy container returns, full height, centred
          if (stackWrap) {
            tl.to(stackWrap, {
              opacity: 1,
              height: "100%",
              top: "0%",
              duration: 0.30,
              ease: "power2.inOut"
            }, qStart + QUOTE_HOLD - CLEAR);
          }
        }

        at += span;

        if (i === QUOTE_AFTER) at += QUOTE_HOLD;
      });

            tl.to({}, { duration: 0.01 }, at);


      // ── cleanup ───────────────────────────────────────
      return function () {
        splits.forEach(function (s) { s.revert(); });
      };
    });
  });
});

// ── IDEOLOGY ────────────────────────────────────────────
// Replaces the IDEOLOGY block in ea.js
//
// SEQUENCE
//   1. title words rise in, centred
//   2. title holds alone
//   3. title travels to the top edge and settles there
//   4. pause on an empty frame
//   5. body words rise in, centred
//   6. body holds so it can actually be read
//   7. quote rises slowly from below and comes to rest ON TOP
//      of the body. the body is never hidden, it stays under
//      the artifact.
//   8. footnote fades in once the image has settled
//
// Every position lives in BEATS and every duration in DUR.
// Nothing else needs editing to change the pacing.
//
// PACING: the timeline ends around 2.9. ideo_track at 900vh
// gives roughly 0.0032 units per vh. If you lengthen a beat,
// scale the track by the same ratio.

document.addEventListener("DOMContentLoaded", function () {
  gsap.utils.toArray("[data-ideology]").forEach(function (sec) {
    var iq = gsap.utils.selector(sec);

    var track = iq("[data-ideology-track]")[0];
    var title = iq("[data-ideo-title]");
    var body = iq("[data-ideo-body]");
    var quote = iq("[data-ideo-quote]");
    var footnote = iq("[data-ideo-footnote]");

    if (!track || !title.length) return;

    // ══ WHEN THINGS HAPPEN ═══════════════════════════════
    var BEATS = {
      titleIn: 0.00,   // words rise into the centre
      titleUp: 0.70,   // title travels to the top edge
      bodyIn: 1.20,    // body arrives, after the title settles
      quoteIn: 2.10,   // quote starts its slow rise
      footIn: 2.70     // footnote fades in once it has landed
    };

    var DUR = {
      titleIn: 0.16,
      titleUp: 0.34,
      bodyIn: 0.16,
      quoteIn: 1.40,   // much slower. it is the beat.
      footIn: 0.20
    };

    // ══ EVERYTHING ELSE ══════════════════════════════════
    var CFG = {
      scrub: 0.4,
      titleStagger: 0.02,
      bodyStagger: 0.015,
      wordRise: 60,      // percent of own height
      quoteRise: 110,    // percent, so it starts fully offscreen
      //quoteTilt: -6,     // degrees it arrives at
      //quoteRest: -1.5,   // degrees it settles at
      titleTop: "1rem"
    };

    gsap.matchMedia().add("(min-width: 992px)", function () {
      var hasSplit = typeof SplitText !== "undefined";
      if (hasSplit) gsap.registerPlugin(SplitText);

      var tSplit = hasSplit ? new SplitText(title, { type: "words" }) : null;
      var bSplit = hasSplit ? new SplitText(body, { type: "words" }) : null;

      var titleWords = tSplit ? tSplit.words : title;
      var bodyWords = bSplit ? bSplit.words : body;

      // the title is centred by yPercent rather than a CSS
      // transform, so GSAP can move it to the top edge
      // without the two fighting for the transform property
      gsap.set(title, { yPercent: -50 });
      gsap.set(titleWords, { opacity: 0, yPercent: CFG.wordRise });
      gsap.set(bodyWords, { opacity: 0, yPercent: CFG.wordRise });

      gsap.set(quote, { yPercent: -50, y: "100vh" });

      gsap.set(footnote, { opacity: 0 });

      var tl = gsap.timeline({
        scrollTrigger: {
          trigger: track,
          start: "top top",
          end: "bottom bottom",
          scrub: CFG.scrub
        }
      });

      // ── 1. title rises into the centre ────────────────
      tl.to(titleWords, {
        opacity: 1,
        yPercent: 0,
        duration: DUR.titleIn,
        ease: "power2.out",
        stagger: { each: CFG.titleStagger }
      }, BEATS.titleIn);

      // ── 2. it holds alone ─────────────────────────────
      // gap from 0.16 to 0.70

      // ── 3. title travels to the top and settles ───────
      tl.to(title, {
        top: CFG.titleTop,
        yPercent: 0,
        duration: DUR.titleUp,
        ease: "power2.inOut"
      }, BEATS.titleUp);

      // ── 4. pause on an empty frame ────────────────────
      // gap from 1.04 to 1.20

      // ── 5. body rises into the vacated centre ─────────
      tl.to(bodyWords, {
        opacity: 1,
        yPercent: 0,
        duration: DUR.bodyIn,
        ease: "power2.out",
        stagger: { each: CFG.bodyStagger }
      }, BEATS.bodyIn);

      // ── 6. the body holds so it can be read ───────────
      // gap from 1.36 to 2.10

      // ── 7. the quote rises slowly and lands on top ────
      // the body is NOT hidden. the artifact comes to rest
      // over it, which is the point: the evidence lands on
      // the argument.
      tl.to(quote, {
        y: 0,
        duration: DUR.quoteIn,
        ease: "none"
      }, BEATS.quoteIn);

      // ── 8. the footnote arrives once it has settled ───
      tl.to(footnote, {
        opacity: 1,
        duration: DUR.footIn,
        ease: "power1.out"
      }, BEATS.footIn);

      tl.to({}, { duration: 2.2 }, BEATS.footIn + DUR.footIn);

      // dead space after 2.90 so the 45 words can be read.
      // lengthen ideo_track rather than editing the numbers.

      return function () {
        if (tSplit) tSplit.revert();
        if (bSplit) bSplit.revert();
      };
    });
  });
});

// ── NUKE ────────────────────────────────────────────────
// Replaces the NUKE block in ea.js
//
// The background texture is NOT animated. It sits at full
// opacity throughout, so the boundary with the section above
// is invisible. Make sure nuke_bg has no opacity value in
// the Designer.
//
// STRICT SEQUENCE. Nothing overlaps.
//   0.00  land travels up from below      ends 0.34
//   0.40  blast rises from behind it      ends 0.76
//   0.82  bits travel down from above     ends 1.16
//   1.30  title reveals word by word      ends 1.62
//   1.80  body reveals word by word       ends 2.10
//   2.90  first quote arrives             long gap before it
//   then each quote in turn
//
// THE QUOTES
// A vertical slider. Each quote travels UP from below the
// frame to centre, holds still for most of its beat, then
// continues UP and out of the top. The movement is fast, the
// pause is long. Nothing ever reverses direction.
//
// The three scene layers never fade. They are forced to
// opacity 1 so any leftover Designer value cannot make them
// fade, and they travel in VIEWPORT units so they always
// start fully off frame whatever their own height is.
//
// nuke_sticky MUST have overflow hidden.
//
// Designer:
//   section_nuke   data-nuke-scene, position relative,
//                  margin-top 0, z-index auto, no box-shadow
//   nuke_track     data-nuke-track, position relative, height 1500vh
//   nuke_sticky    sticky, top 0, height 100svh, overflow hidden
//
//   nuke_bg        data-nuke="texture", absolute, inset 0,
//                  z-index 0, NO opacity
//   nuke_blast     data-nuke="blast", absolute, bottom 0,
//                  left 50%, width 62%, z-index 1, NO transform
//   nuke_land      data-nuke="land", absolute, bottom 0,
//                  left 0, width 100%, z-index 2, NO transform
//   nuke_bits      data-nuke="bits", absolute, top 0,
//                  left 50%, width 40%, z-index 3, NO transform
//
//   nuke_text      data-nuke-text, wrapper for both
//     nuke_title   data-nuke-title
//     nuke_body    data-nuke-body
//
//   nuke_slide ×3  data-nuke-slide, absolute, top 50%,
//                  left 0, right 0, NO transform
//
//   Needs SplitText ticked in Site Settings, Integrations.

document.addEventListener("DOMContentLoaded", function () {
  gsap.utils.toArray("[data-nuke-scene]").forEach(function (sec) {
    var nq = gsap.utils.selector(sec);

    var track = nq("[data-nuke-track]")[0];
    var land = nq('[data-nuke="land"]');
    var blast = nq('[data-nuke="blast"]');
    var bits = nq('[data-nuke="bits"]');
    var title = nq("[data-nuke-title]");
    var body = nq("[data-nuke-body]");
    var slides = nq("[data-nuke-slide]");

    if (!track) return;

    // ══ WHEN THINGS HAPPEN ═══════════════════════════════
    // every beat finishes before the next one starts
    var BEATS = {
      land: 0.00,    // ends 0.34
      blast: 0.40,   // ends 0.76
      bits: 0.82,    // ends 1.16
      title: 1.30,   // ends 1.62 with stagger
      body: 1.80,    // ends 2.10 with stagger
      slides: 2.90   // long pause after the body settles
    };

    // ══ HOW LONG THINGS TAKE ═════════════════════════════
    var DUR = {
      land: 0.34,
      blast: 0.36,
      bits: 0.34,
      title: 0.20,
      body: 0.20,
      slideMove: 0.20   // fast. the pause does the work.
    };

    // ══ EVERYTHING ELSE ══════════════════════════════════
    var CFG = {
      scrub: 0.4,

      // scene layers travel in VIEWPORT units, not element
      // units, so they always start fully off frame
      landFrom: "100vh",
      blastFrom: "100vh",
      bitsFrom: "-100vh",

      wordRise: 50,       // percent of own height
      titleStagger: 0.03,
      bodyStagger: 0.02,

      // the vertical slider
      slideStep: 1.80,    // scroll distance per quote
      slideFrom: "100vh",  // enters from here, below the frame
      slideTo: "-100vh",   // exits to here, above the frame

      endHold: 2.40       // empty scroll after the last quote
    };

    gsap.matchMedia().add("(min-width: 992px)", function () {
      var hasSplit = typeof SplitText !== "undefined";
      if (hasSplit) gsap.registerPlugin(SplitText);

      // every split instance, so the cleanup can put the
      // markup back on a resize
      var splits = [];

      function splitOf(el) {
        if (!hasSplit || !el || !el.length) return null;
        var s = new SplitText(el, { type: "words" });
        splits.push(s);
        return s.words;
      }

      var titleWords = splitOf(title) || title;
      var bodyWords = splitOf(body) || body;

      // ── starting states ─────────────────────────────────
      // opacity forced to 1 on the scene layers so a leftover
      // Designer value cannot make them fade. xPercent does
      // the left 50% centring so nothing in CSS fights GSAP
      // for the transform.
      gsap.set(land, { y: CFG.landFrom, opacity: 1 });
      gsap.set(blast, { y: CFG.blastFrom, xPercent: -50, opacity: 1 });
      gsap.set(bits, { y: CFG.bitsFrom, xPercent: -50, opacity: 1 });

      gsap.set(titleWords, { opacity: 0, yPercent: CFG.wordRise });
      gsap.set(bodyWords, { opacity: 0, yPercent: CFG.wordRise });

      // quotes wait below the frame, already visible, so the
      // slider reads as movement rather than a fade
      gsap.set(slides, {
        y: CFG.slideFrom,
        yPercent: -50,
        opacity: 1
      });

      var tl = gsap.timeline({
        scrollTrigger: {
          trigger: track,
          start: "top top",
          end: "bottom bottom",
          scrub: CFG.scrub
        }
      });

      // ── 1. land travels up from below the frame ───────
      tl.to(land, {
        y: 0,
        duration: DUR.land,
        ease: "power2.out"
      }, BEATS.land);

      // ── 2. blast rises from behind the land ───────────
      tl.to(blast, {
        y: 0,
        duration: DUR.blast,
        ease: "power2.out"
      }, BEATS.blast);

      // ── 3. bits travel down from above the frame ──────
      tl.to(bits, {
        y: 0,
        duration: DUR.bits,
        ease: "power2.out"
      }, BEATS.bits);

      // gap: the scene settles

      // ── 4. title reveals, alone ───────────────────────
      tl.to(titleWords, {
        opacity: 1,
        yPercent: 0,
        duration: DUR.title,
        ease: "power2.out",
        stagger: { each: CFG.titleStagger }
      }, BEATS.title);

      // gap: the title holds by itself

      // ── 5. body follows, once the title has finished ──
      tl.to(bodyWords, {
        opacity: 1,
        yPercent: 0,
        duration: DUR.body,
        ease: "power2.out",
        stagger: { each: CFG.bodyStagger }
      }, BEATS.body);

      // gap: 0.80 of nothing before the first quote

      // ── 6. the vertical slider ────────────────────────
      // each quote travels up into centre, holds still for
      // most of its beat, then continues up and out. the
      // movement never reverses, so it reads as one belt
      // moving through the frame.
      var lastAt = BEATS.slides;

      slides.forEach(function (slide, i) {
        var at = BEATS.slides + i * CFG.slideStep;
        var last = i === slides.length - 1;

        // in, fast
        tl.to(slide, {
          y: 0,
          duration: DUR.slideMove,
          ease: "power3.out"
        }, at);

        // holds still for the rest of its beat

        // out through the top, same direction, same speed
        if (!last) {
          tl.to(slide, {
            y: CFG.slideTo,
            duration: DUR.slideMove,
            ease: "power3.in"
          }, at + CFG.slideStep - DUR.slideMove);
        }

        lastAt = at;
      });

      // ── 7. the final quote holds ──────────────────────
      // the timeline ends at its last tween, so an empty
      // tween reserves the hold and makes it real scroll
      tl.to({}, { duration: CFG.endHold }, lastAt + DUR.slideMove);

      return function () {
        splits.forEach(function (s) { s.revert(); });
      };
    });
  });
});
// ── MATH ────────────────────────────────────────────────
// Replaces the MATH block in ea.js
//
// The three stack items run one at a time. Each rises into
// the centre, holds, then lifts away as the next arrives.
// No orange turn. The section stays dark throughout.
//
// Designer:
//   section_math   data-math-scene, position relative, bg #0d1117
//   math_track     data-math-track, position relative, height 900vh
//   math_sticky    sticky, top 0, height 100svh, width 100%,
//                  overflow hidden, bg #0d1117
//
//   padding-global   absolute, inset 0, z-index 1, flex, centered
//     container-large  width 100%
//       math_stack     data-math-stack, position relative,
//                      width 100%, height 100%, flex, centered
//         math_title / math_copy / math_quote
//           each data-math-item
//           each position ABSOLUTE, top 50%, left 50%,
//           width 100%, NO transform. GSAP owns the centring
//           via xPercent and yPercent so it can move them.
//
//   math_field     absolute, inset 0, z-index 2
//     math_field-lyr        data-math-field="all"
//     math_field-lyr is-lit data-math-field="lit"
//       math_field-img      Image, 100%/100%, object-fit cover
//
//   math_caption   Div, data-math-caption
//                  position absolute, top 50%,
//                  LEFT 0, WIDTH 100%, MAX-WIDTH NONE,
//                  text-align center, background-color #0d1117,
//                  padding 2.5vh 1.5vw, z-index 3, NO transform
//                  Full-width band, or dots show beside it.
//     math_caption-head  data-math-head, placeholder text needed
//     math_caption-sub   data-math-sub, placeholder text needed
//
//   math_burst     data-math-burst, absolute, top 50%, left 50%,
//                  6px circle, z-index 4, NO transform
//
//   math_end       data-math-end, absolute, inset 0, z-index 5,
//                  flex column centered, pointer-events none

document.addEventListener("DOMContentLoaded", function () {

  gsap.registerPlugin(ScrollTrigger);

  gsap.utils.toArray("[data-math-scene]").forEach(function (sec) {

    var q = gsap.utils.selector(sec);

    var track = q("[data-math-track]")[0];

    var title = q("[data-math-title]")[0];
    var body = q("[data-math-body]")[0];
    var quote = q("[data-math-quote]")[0];

    var field = q('[data-dot-field="true"]')[0];

    var caption = q("[data-math-caption]")[0];
    var capHead = q("[data-math-head]")[0];
    var capSub = q("[data-math-sub]")[0];

    var burst = q("[data-math-burst]")[0];
    var end = q("[data-math-end]")[0];

    if (
      !track ||
      !title ||
      !body ||
      !quote ||
      !field ||
      !caption ||
      !capHead ||
      !capSub ||
      !burst ||
      !end
    ) {
      console.warn("Math scene: missing required element.");
      return;
    }


    // ── CONFIG ──────────────────────────────────────

    var TEXT_IN = 0.30;
    var TEXT_OUT = 0.25;

    var IN_STAGGER = 0.055;
    var OUT_STAGGER = 0.035;

    var TITLE_HOLD = 1.10;
    var BODY_HOLD = 1.40;
    var QUOTE_HOLD = 1.35;

    var ITEM_GAP = 0.18;
    var CAPTION_GAP = 0.35;

    var QUOTE_RISE = 0.55;

    var XFADE = 0.55;
    var DOT_FADED_OPACITY = 0.12;

    var CAP_TOP = "0vh";
    var FIELD_REST = 0;

    var BURST_SCALE = 420;

    var END_HOLD = 1.75;


    // ── CAPTION COPY ────────────────────────────────

    var CAPTION_1 = "People who do not exist yet";
    var SUB_1 = "10⁵⁸ potential future lives";

    var CAPTION_2 = "8,000,000,000";
    var SUB_2 = "Everyone alive today";


    // ── DOTS ────────────────────────────────────────

    var COLS = 49;
    var ROWS = 25;

    var DOT_SIZE_MIN = 10;
    var DOT_SIZE_MAX = 14;

var PULSE_CHANCE = 0.10;

var PULSE_CHANGE_MIN = 3;
var PULSE_CHANGE_MAX = 5;

var PULSE_DURATION_MIN = 1.2;
var PULSE_DURATION_MAX = 2.4;

    var DOT_COLOR = "#ff684d";


    function random(min, max) {
      return Math.random() * (max - min) + min;
    }


    // ── BUILD DOT FIELD ─────────────────────────────

    field.innerHTML = "";

    var centerCol = Math.floor(COLS / 2);
    var centerRow = Math.floor(ROWS / 2);


    for (var i = 0; i < COLS * ROWS; i++) {

      var dot = document.createElement("div");
      dot.className = "math-dot";

      var col = i % COLS;
      var row = Math.floor(i / COLS);

      var size = random(
        DOT_SIZE_MIN,
        DOT_SIZE_MAX
      );


      dot.style.setProperty(
        "--dot-size",
        size.toFixed(2) + "px"
      );


      var inCenterBlock =
        Math.abs(col - centerCol) <= 1 &&
        Math.abs(row - centerRow) <= 1;


      // Actual mathematical center dot
      var exactCenter =
        col === centerCol &&
        row === centerRow;


      // Remove ONE corner from the 3 × 3
      // so only 8 dots remain highlighted.
      var excludedCorner =
        col === centerCol - 1 &&
        row === centerRow - 1;


      var fixed =
        inCenterBlock &&
        !excludedCorner;


      if (exactCenter) {
        dot.classList.add("is-center");
      }


      if (fixed) {

        dot.classList.add("is-fixed");

      } else if (Math.random() < PULSE_CHANCE) {

        dot.classList.add("is-pulsing");

        var change = random(
          PULSE_CHANGE_MIN,
          PULSE_CHANGE_MAX
        );

        var direction =
          Math.random() < 0.5 ? -1 : 1;

        var targetSize =
          Math.max(
            2,
            size + change * direction
          );


        dot.style.setProperty(
          "--pulse-scale",
          (targetSize / size).toFixed(3)
        );


        dot.style.setProperty(
          "--pulse-duration",
          random(
            PULSE_DURATION_MIN,
            PULSE_DURATION_MAX
          ).toFixed(2) + "s"
        );


        dot.style.setProperty(
          "--pulse-delay",
          -random(0, 3).toFixed(2) + "s"
        );

      }


      field.appendChild(dot);
    }



    var normalDots = gsap.utils.toArray(
      field.querySelectorAll(
        ".math-dot:not(.is-fixed)"
      )
    );


    var fixedDots = gsap.utils.toArray(
      field.querySelectorAll(
        ".math-dot.is-fixed"
      )
    );


    var centerDot =
      field.querySelector(".math-dot.is-center");


    gsap.set(normalDots, {
      opacity: 1,
      backgroundColor: DOT_COLOR
    });


    gsap.set(fixedDots, {
      opacity: 1,
      backgroundColor: DOT_COLOR
    });



    // ── ALIGN BURST TO TRUE CENTER DOT ──────────────

    function alignBurst() {

      if (!centerDot || !burst) return;

      var dotRect =
        centerDot.getBoundingClientRect();

      var parent =
        burst.offsetParent;

      if (!parent) return;

      var parentRect =
        parent.getBoundingClientRect();


      gsap.set(burst, {

        left:
          dotRect.left -
          parentRect.left +
          dotRect.width / 2,

        top:
          dotRect.top -
          parentRect.top +
          dotRect.height / 2,

        xPercent: -50,
        yPercent: -50,

        marginTop: 0,
        marginLeft: 0

      });

    }


    // Wait until browser has laid out the generated grid.
    requestAnimationFrame(function () {
      alignBurst();
    });


    // Recalculate if viewport dimensions change.
    window.addEventListener(
      "resize",
      alignBurst
    );


    // Recalculate again once fonts have settled.
    if (document.fonts && document.fonts.ready) {

      document.fonts.ready.then(function () {

        alignBurst();
        ScrollTrigger.refresh();

      });

    }



    // ── CAPTION LAYERS ──────────────────────────────

    function makeCaptionLayers(
      container,
      oldText,
      newText
    ) {

      container.innerHTML = "";

      container.style.position = "relative";
      container.style.overflow = "hidden";

      var oldLayer =
        document.createElement("span");

      var newLayer =
        document.createElement("span");

      oldLayer.textContent =
        oldText;

      newLayer.textContent =
        newText;


      oldLayer.style.display =
        "block";

      oldLayer.style.position =
        "relative";


      newLayer.style.display =
        "block";

      newLayer.style.position =
        "absolute";

      newLayer.style.inset =
        "0";

      newLayer.style.width =
        "100%";


      container.appendChild(
        oldLayer
      );

      container.appendChild(
        newLayer
      );


      return {
        old: oldLayer,
        next: newLayer
      };

    }


    var headLayers =
      makeCaptionLayers(
        capHead,
        CAPTION_1,
        CAPTION_2
      );


    var subLayers =
      makeCaptionLayers(
        capSub,
        SUB_1,
        SUB_2
      );



    // ── DESKTOP ─────────────────────────────────────

    gsap.matchMedia().add(
      "(min-width: 992px)",
      function () {

        var hasSplit =
          typeof SplitText !== "undefined";


        if (hasSplit) {
          gsap.registerPlugin(SplitText);
        }


        var splits = [];


        function splitWords(el) {

          if (!hasSplit) {
            return [el];
          }


          var split =
            new SplitText(
              el,
              {
                type: "words"
              }
            );


          splits.push(split);

          return split.words;

        }



        var titleWords =
          splitWords(title);

        var bodyWords =
          splitWords(body);

        var quoteWords =
          splitWords(quote);


        var oldHeadWords =
          splitWords(headLayers.old);

        var oldSubWords =
          splitWords(subLayers.old);

        var newHeadWords =
          splitWords(headLayers.next);

        var newSubWords =
          splitWords(subLayers.next);


        var endWords =
          splitWords(end);



        var allStackWords = []
          .concat(
            titleWords,
            bodyWords,
            quoteWords
          )
          .filter(Boolean);


        var oldCaptionWords = []
          .concat(
            oldHeadWords,
            oldSubWords
          )
          .filter(Boolean);


        var newCaptionWords = []
          .concat(
            newHeadWords,
            newSubWords
          )
          .filter(Boolean);



        // ── INITIAL STATES ───────────────────────────

        gsap.set(
          [title, body],
          {
            autoAlpha: 0,
            xPercent: -50,
            yPercent: -50
          }
        );


        gsap.set(
          quote,
          {
            autoAlpha: 0,
            xPercent: -50,
            yPercent: -50,
            y: 0
          }
        );


        gsap.set(
          allStackWords,
          {
            autoAlpha: 0,
            yPercent: 55
          }
        );


        gsap.set(
          field,
          {
            opacity: 0,
            yPercent: 100
          }
        );


        gsap.set(
          caption,
          {
            opacity: 0,
            yPercent: -50
          }
        );


        gsap.set(
          oldCaptionWords,
          {
            autoAlpha: 0,
            yPercent: 55
          }
        );


        gsap.set(
          newCaptionWords,
          {
            autoAlpha: 0,
            yPercent: 120
          }
        );


        gsap.set(
          burst,
          {
            opacity: 0,
            scale: 1,

            // Position comes from alignBurst()
            xPercent: -50,
            yPercent: -50,

            marginTop: 0,
            marginLeft: 0
          }
        );


        // Position again after GSAP has established
        // its starting transforms.
        alignBurst();


        gsap.set(
          end,
          {
            autoAlpha: 0
          }
        );


        gsap.set(
          endWords,
          {
            autoAlpha: 0,
            yPercent: 55
          }
        );



        // ── TIMELINE ─────────────────────────────────

        var tl =
          gsap.timeline({

            scrollTrigger: {

              trigger: track,

              start: "top top",
              end: "bottom bottom",

              scrub: 0.4

            }

          });



        // ── STANDARD TITLE / BODY ───────────────────

        function addTextScene(
          element,
          words,
          hold
        ) {

          tl.set(
            element,
            {
              autoAlpha: 1
            }
          );


          tl.to(
            words,
            {
              autoAlpha: 1,
              yPercent: 0,

              duration:
                TEXT_IN,

              ease:
                "power3.out",

              stagger: {
                each:
                  IN_STAGGER
              }
            }
          );


          tl.to(
            {},
            {
              duration:
                hold
            }
          );


          tl.to(
            words,
            {
              autoAlpha: 0,
              yPercent: -55,

              duration:
                TEXT_OUT,

              ease:
                "power2.in",

              stagger: {
                each:
                  OUT_STAGGER
              }
            }
          );


          tl.set(
            element,
            {
              autoAlpha: 0
            }
          );


          tl.to(
            {},
            {
              duration:
                ITEM_GAP
            }
          );

        }



        // ── QUOTE ───────────────────────────────────
        //
        // BELOW → CENTER → ABOVE
        // ────────────────────────────────────────────

        function addQuoteScene(
          words,
          hold
        ) {

          // Starts BELOW

          tl.set(
            quote,
            {
              autoAlpha: 1,
              y: "45vh"
            }
          );


          // BELOW → CENTER

          tl.to(
            quote,
            {
              y: 0,

              duration:
                QUOTE_RISE,

              ease:
                "power3.out"
            }
          );


          // Reveal words during entrance

          tl.to(
            words,
            {
              autoAlpha: 1,
              yPercent: 0,

              duration:
                TEXT_IN,

              ease:
                "power3.out",

              stagger: {
                each:
                  IN_STAGGER
              }
            },
            "<"
          );


          // Hold in center

          tl.to(
            {},
            {
              duration:
                hold
            }
          );


          // CENTER → ABOVE

          tl.to(
            quote,
            {
              y: "-45vh",

              duration:
                QUOTE_RISE,

              ease:
                "power2.in"
            }
          );


          // Words fade during upward exit

          tl.to(
            words,
            {
              autoAlpha: 0,

              duration:
                TEXT_OUT,

              ease:
                "power2.in",

              stagger: {
                each:
                  OUT_STAGGER
              }
            },
            "<"
          );


          tl.set(
            quote,
            {
              autoAlpha: 0
            }
          );


          tl.to(
            {},
            {
              duration:
                ITEM_GAP
            }
          );

        }



        // 1. TITLE

        addTextScene(
          title,
          titleWords,
          TITLE_HOLD
        );


        // 2. BODY

        addTextScene(
          body,
          bodyWords,
          BODY_HOLD
        );


        // 3. QUOTE

        addQuoteScene(
          quoteWords,
          QUOTE_HOLD
        );



        // 4. PEOPLE WHO DO NOT EXIST YET

        var capAt =
          tl.duration() +
          CAPTION_GAP;


        tl.set(
          caption,
          {
            opacity: 1
          },
          capAt
        );


        tl.to(
          oldHeadWords,
          {
            autoAlpha: 1,
            yPercent: 0,

            duration: 0.30,

            ease:
              "power3.out",

            stagger: {
              each: 0.05
            }
          },
          capAt
        );


        tl.to(
          oldSubWords,
          {
            autoAlpha: 1,
            yPercent: 0,

            duration: 0.24,

            ease:
              "power3.out",

            stagger: {
              each: 0.035
            }
          },
          capAt + 0.10
        );



        // 5. DOT FIELD RISES

        var fieldAt =
          capAt + 0.75;


        tl.to(
          field,
          {
            opacity: 1,

            yPercent:
              FIELD_REST,

            duration: 0.38,

            ease:
              "power2.out"
          },
          fieldAt
        );


        tl.to(
          caption,
          {
            top:
              CAP_TOP,

            yPercent: 0,

            duration: 0.34,

            ease:
              "power2.out"
          },
          fieldAt + 0.06
        );



        // 6. DOT FADE

        var litAt =
          fieldAt + 2.4;


        tl.to(
          normalDots,
          {
            opacity:
              DOT_FADED_OPACITY,

            duration:
              XFADE,

            ease:
              "none"
          },
          litAt
        );


        tl.set(
          fixedDots,
          {
            opacity: 1
          },
          litAt
        );



        // 7. CAPTION SWAP AT 80%

        var swapAt =
          litAt +
          XFADE * 0.8;


        tl.to(
          oldHeadWords,
          {
            autoAlpha: 0,
            yPercent: -110,

            duration: 0.20,

            ease:
              "power2.in",

            stagger: {
              each: 0.035
            }
          },
          swapAt - 0.20
        );


        tl.to(
          oldSubWords,
          {
            autoAlpha: 0,
            yPercent: -110,

            duration: 0.18,

            ease:
              "power2.in",

            stagger: {
              each: 0.025
            }
          },
          swapAt - 0.16
        );


        tl.to(
          newHeadWords,
          {
            autoAlpha: 1,
            yPercent: 0,

            duration: 0.30,

            ease:
              "power3.out",

            stagger: {
              each: 0.04
            }
          },
          swapAt
        );


        tl.to(
          newSubWords,
          {
            autoAlpha: 1,
            yPercent: 0,

            duration: 0.26,

            ease:
              "power3.out",

            stagger: {
              each: 0.035
            }
          },
          swapAt + 0.06
        );



        // 8. BURST

        var burstAt =
          litAt + 1.30;


        // Reconfirm exact center immediately
        // before the burst becomes visible.

        tl.call(
          alignBurst,
          null,
          burstAt - 0.01
        );


        tl.to(
          burst,
          {
            opacity: 1,
            duration: 0.06
          },
          burstAt
        );


        tl.to(
          burst,
          {
            scale:
              BURST_SCALE,

            duration: 0.36,

            ease:
              "power2.in"
          },
          burstAt + 0.04
        );


        tl.to(
          [field, caption],
          {
            opacity: 0,

            duration: 0.14
          },
          burstAt + 0.24
        );



        // 9. END TEXT

        var endAt =
          burstAt + 0.44;


        tl.set(
          end,
          {
            autoAlpha: 1
          },
          endAt
        );


        tl.to(
          endWords,
          {
            autoAlpha: 1,
            yPercent: 0,

            duration: 0.35,

            ease:
              "power3.out",

            stagger: {
              each: 0.055
            }
          },
          endAt
        );


        tl.to(
          {},
          {
            duration:
              END_HOLD
          }
        );



        return function () {

          splits.forEach(
            function (split) {
              split.revert();
            }
          );

        };

      }
    );

  });

});


// ── OPTIMIZED WORLD ─────────────────────────────────────
// Replaces the OPTIMIZED WORLD block in ea.js
//
// Strict sequence, nothing overlaps. One beat cycle:
//   +0.00   head fades in
//   +0.02   copy fades in
//   +0.46   quote slapped on
//   +0.64   whole block thrown up and left, ends +0.84
//   +0.86   block hidden, frame empty
//   +0.88   background turns, ends +1.06
//   +1.08   next block starts
//
// The head, copy and quote all live inside opt_block, so the
// throw takes them together as one object.
//
// No yoyo or repeat tweens in here. On a scrubbed timeline
// those scrub rather than play, so scrolling through one drags
// the element back and forth instead of hitting it once.
//
// COLOURS
//   intro     #ecefde  (also set on opt_sticky in the Designer)
//   block 1   #fe6249  orange
//   block 2   #0e37e2  blue
//   block 3   #fe6249  orange
//   block 4   #0e37e2  blue
//
//   Text is #0d1117 throughout, set once in the Designer on
//   opt_head and opt_copy. The script does not touch colour.
//   Check block 2 and 4 for contrast: black on a deep blue is
//   tight at body size.
//
// Designer:
//   section_opt      data-opt-scene, position relative
//     opt_track      data-opt-track, position relative, height 1200vh
//       opt_sticky   sticky, top 0, height 100svh, width 100%,
//                    overflow hidden, background-color #ecefde
//
//         opt_stage      position absolute, inset 0, z-index 1
//
//           opt_block    data-opt-block, data-opt-bg
//                        position absolute, inset 0,
//                        display flex, flex-direction column,
//                        justify-content center, padding 0 12vw,
//                        transform-origin center center
//                        NO transform. GSAP owns it.
//             opt_head   Text Block, data-opt-head
//             opt_copy   Text Block, data-opt-copy, max-width 44ch
//             opt_quote  Div, data-opt-quote, position absolute,
//                        top 54%, left 28%, width 52%, z-index 2
//                        NO transform.
//               opt_quote-img  Image, width 100%, height auto
//
//         opt_intro      data-opt-intro, position absolute, inset 0,
//                        z-index 3, flex centered, padding 0 10vw
//           opt_intro-txt  Heading H2
//
//   Webflow does not copy custom attributes onto duplicated
//   children. Check after duplicating a block:
//     document.querySelectorAll("[data-opt-block]").forEach(
//       function(b,i){ console.log(i,
//         b.getAttribute("data-opt-bg"),
//         !!b.querySelector("[data-opt-head]"),
//         !!b.querySelector("[data-opt-copy]"),
//         !!b.querySelector("[data-opt-quote]")); });
//
//   NO opacity values anywhere in this section.

document.addEventListener("DOMContentLoaded", function () {

  gsap.registerPlugin(ScrollTrigger);

  gsap.utils
    .toArray("[data-opt-scene]")
    .forEach(function (sec) {

      var q = gsap.utils.selector(sec);

      var track =
        q("[data-opt-track]")[0];

      var intro =
        q("[data-opt-intro]")[0];

      var introText =
        q("[data-opt-intro-txt]")[0] || intro;

      var blocks =
        q("[data-opt-block]");

      if (
        !track ||
        !intro ||
        !blocks.length
      ) {
        return;
      }


      // ─────────────────────────────────────────────
      // CONFIG
      // ─────────────────────────────────────────────

      var INTRO_IN = 0.35;
      var INTRO_STAGGER = 0.055;
      var INTRO_HOLD = 0.80;

      var CARD_IN = 0.85;
      var CARD_HOLD = 0.55;

      var QUOTE_IN = 0.65;
      var QUOTE_HOLD = 0.95;

      // Quote starts this far below
      // its Designer position.
      var QUOTE_START = "65vh";

      // How far title + body move upward
      // when quote enters.
      var TEXT_PUSH = "-17vh";


      // ─────────────────────────────────────────────
      // TRAPEZOID TOP
      //
      // BOTH top corners are below viewport top.
      //
      // Left corner = 7% down
      // Right corner = 2.5% down
      //
      // The transparent area above reveals
      // the previous card underneath.
      // ─────────────────────────────────────────────

var CARD_CLIPS = [
  "polygon(0 8%, 100% 3%, 100% 100%, 0 100%)",
  "polygon(0 4%, 100% 9%, 100% 100%, 0 100%)",
  "polygon(0 10%, 100% 5%, 100% 100%, 0 100%)",
  "polygon(0 6%, 100% 2%, 100% 100%, 0 100%)"
];


      gsap.matchMedia().add(
        "(min-width: 992px)",
        function () {


          // ─────────────────────────────────────────
          // SPLIT INTRO
          // ─────────────────────────────────────────

          var introSplit = null;
          var introWords = [introText];


          if (typeof SplitText !== "undefined") {

            gsap.registerPlugin(SplitText);

            introSplit =
              new SplitText(
                introText,
                {
                  type: "words"
                }
              );

            introWords =
              introSplit.words;
          }


          // ─────────────────────────────────────────
          // INTRO
          // ─────────────────────────────────────────

          gsap.set(intro, {
            zIndex: 1
          });


          gsap.set(
            introWords,
            {
              autoAlpha: 0,
              yPercent: 55
            }
          );


          // ─────────────────────────────────────────
          // BLOCK INITIAL STATES
          // ─────────────────────────────────────────

          blocks.forEach(function (block, i) {

            var head =
              block.querySelector(
                "[data-opt-head]"
              );

            var copy =
              block.querySelector(
                "[data-opt-copy]"
              );

            var quote =
              block.querySelector(
                "[data-opt-quote]"
              );


            // Every new card sits ABOVE
            // the previous card.

            gsap.set(block, {

              zIndex: i + 2,

              // Start one viewport below.
              yPercent: 100,

              // Absolutely no tilt / scale / fade.
              rotation: 0,
              scale: 1,

              // Real transparent trapezoid.
clipPath:
  CARD_CLIPS[i % CARD_CLIPS.length]

            });


            // Title/body stay exactly as designed.
            // Only their vertical position will move
            // when the quote arrives.

            if (head) {
              gsap.set(head, {
                y: 0
              });
            }

            if (copy) {
              gsap.set(copy, {
                y: 0
              });
            }


            // Quote starts below its final
            // Webflow Designer position.

            if (quote) {

              gsap.set(quote, {
                y: QUOTE_START
              });

            }

          });



          // ─────────────────────────────────────────
          // MASTER SCROLL TIMELINE
          // ─────────────────────────────────────────

          var tl =
            gsap.timeline({

              scrollTrigger: {

                trigger: track,

                start: "top top",
                end: "bottom bottom",

                scrub: 0.4

              }

            });



          // ═════════════════════════════════════════
          // INTRO
          // ═════════════════════════════════════════

          tl.to(
            introWords,
            {
              autoAlpha: 1,
              yPercent: 0,

              duration: INTRO_IN,
              ease: "power3.out",

              stagger: {
                each: INTRO_STAGGER
              }
            }
          );


          tl.to(
            {},
            {
              duration: INTRO_HOLD
            }
          );



          // ═════════════════════════════════════════
          // STACKED CARDS
          // ═════════════════════════════════════════

          blocks.forEach(function (block) {

            var head =
              block.querySelector(
                "[data-opt-head]"
              );

            var copy =
              block.querySelector(
                "[data-opt-copy]"
              );

            var quote =
              block.querySelector(
                "[data-opt-quote]"
              );


            // ───────────────────────────────────────
            // 1. NEW CARD SLIDES OVER PREVIOUS CARD
            //
            // Previous card does NOTHING.
            // ───────────────────────────────────────

            tl.to(
              block,
              {
                yPercent: 0,

                duration: CARD_IN,

                ease: "none"
              }
            );


            // Card is now fully positioned.
            // Let title/body breathe.

            tl.to(
              {},
              {
                duration: CARD_HOLD
              }
            );



            // ───────────────────────────────────────
            // 2. QUOTE ENTERS FROM BELOW
            // ───────────────────────────────────────

            if (quote) {

              tl.to(
                quote,
                {
                  y: 0,

                  duration: QUOTE_IN,

                  ease: "power3.out"
                }
              );


              // ─────────────────────────────────────
              // Title + body pushed upward
              // simultaneously.
              // ─────────────────────────────────────

              var textTargets = [];

              if (head) {
                textTargets.push(head);
              }

              if (copy) {
                textTargets.push(copy);
              }


              if (textTargets.length) {

                tl.to(
                  textTargets,
                  {
                    y: TEXT_PUSH,

                    duration: QUOTE_IN,

                    ease: "power3.inOut"
                  },
                  "<"
                );

              }

            }



            // ───────────────────────────────────────
            // 3. FULL COMPOSITION HOLDS
            // ───────────────────────────────────────

            tl.to(
              {},
              {
                duration: QUOTE_HOLD
              }
            );


            // THAT'S IT.
            //
            // No outgoing animation.
            //
            // Next iteration simply brings
            // the next card over this one.

          });



          // ─────────────────────────────────────────
          // FINAL HOLD
          // ─────────────────────────────────────────

          tl.to(
            {},
            {
              duration: 1.2
            }
          );



          // ─────────────────────────────────────────
          // CLEANUP
          // ─────────────────────────────────────────

          return function () {

            if (introSplit) {
              introSplit.revert();
            }

          };

        }
      );

    });

});

document.addEventListener("DOMContentLoaded", function () {

  gsap.registerPlugin(ScrollTrigger);

  gsap.utils.toArray(".section_ftx").forEach(function (sec) {

    var track =
      sec.querySelector(".ftx_track");

    var camera =
      sec.querySelector(".ftx_camera");

    var background =
      sec.querySelector(".ftx_background");

    var face =
      sec.querySelector(".ftx_face");

    var money =
      sec.querySelector(".ftx_money");

    var blocks =
      gsap.utils.toArray(
        sec.querySelectorAll(".ftx_block")
      );


    if (
      !track ||
      !camera ||
      !background ||
      !face ||
      !money ||
      !blocks.length
    ) {
      console.warn("FTX: missing required element.");
      return;
    }



    // ─────────────────────────────────────────────
    // CONFIG
    // ─────────────────────────────────────────────

    var WORD_IN = 0.32;
    var WORD_OUT = 0.22;

    var WORD_STAGGER_IN = 0.055;
    var WORD_STAGGER_OUT = 0.03;

    var TEXT_HOLD = 0.70;


    // FACE
    var FACE_FADE = 0.55;


    // MONEY
    var MONEY_START = "100vh";
    var MONEY_IN = 0.65;


    // QUOTE CARD
    var QUOTE_IN = 0.38;
    var QUOTE_OUT = 0.28;

    var QUOTE_Y = 28;
    var QUOTE_SCALE = 0.975;


    // COUNTERS
    var COUNT_IN = 0.65;


    // ─────────────────────────────────────────────
    // THREE-EYE FOCAL POINT
    //
    // Calculated from uploaded artwork.
    //
    // This is relative to the SOURCE IMAGE,
    // not the Webflow viewport.
    // ─────────────────────────────────────────────

    var FOCUS_SOURCE_X = 67.93;
    var FOCUS_SOURCE_Y = 22.74;


    // How close we finish.
    var FINAL_ZOOM = 3.8;



    gsap.matchMedia().add(
      "(min-width: 992px)",
      function () {


        // ─────────────────────────────────────────
        // MAP SOURCE FOCAL POINT INTO
        // OBJECT-FIT:COVER CAMERA COORDINATES
        // ─────────────────────────────────────────

        function getCameraFocus() {

          var cw =
            camera.clientWidth;

          var ch =
            camera.clientHeight;


          var iw =
            background.naturalWidth;

          var ih =
            background.naturalHeight;


          if (
            !cw ||
            !ch ||
            !iw ||
            !ih
          ) {

            return {
              x: FOCUS_SOURCE_X,
              y: FOCUS_SOURCE_Y
            };

          }


          // object-fit: cover
          var scale =
            Math.max(
              cw / iw,
              ch / ih
            );


          var renderedWidth =
            iw * scale;

          var renderedHeight =
            ih * scale;


          // object-position: 50% 50%
          var offsetX =
            (cw - renderedWidth) / 2;

          var offsetY =
            (ch - renderedHeight) / 2;


          // Focal point inside rendered image
          var focusX =
            offsetX +
            renderedWidth *
            (FOCUS_SOURCE_X / 100);


          var focusY =
            offsetY +
            renderedHeight *
            (FOCUS_SOURCE_Y / 100);


          // Convert back into camera percentages
          return {

            x:
              focusX /
              cw *
              100,

            y:
              focusY /
              ch *
              100

          };

        }



        function applyCameraFocus() {

          var focus =
            getCameraFocus();


          gsap.set(
            camera,
            {
              transformOrigin:
                focus.x +
                "% " +
                focus.y +
                "%"
            }
          );


          console.log(
            "FTX zoom focus:",
            focus.x.toFixed(2) + "%",
            focus.y.toFixed(2) + "%"
          );

        }


        applyCameraFocus();



        // ─────────────────────────────────────────
        // SPLITTEXT
        // ─────────────────────────────────────────

        var hasSplit =
          typeof SplitText !== "undefined";


        if (hasSplit) {
          gsap.registerPlugin(SplitText);
        }


        var splits = [];


        function splitElement(el) {

          if (!el) {
            return [];
          }


          if (!hasSplit) {
            return [el];
          }


          var split =
            new SplitText(
              el,
              {
                type: "words"
              }
            );


          splits.push(split);

          return split.words;

        }



        // ─────────────────────────────────────────
        // BLOCK DATA
        // ─────────────────────────────────────────

        var blockData =
          blocks.map(function (block) {


            var textTargets =
              gsap.utils.toArray(
                block.querySelectorAll(
                  '[data-ftx-text="true"]'
                )
              );


            if (!textTargets.length) {

              textTargets =
                gsap.utils.toArray(
                  block.querySelectorAll(
                    '[data-ftx-item="true"]:not(.ftx-fig)'
                  )
                );

            }


            var words = [];


            textTargets.forEach(function (el) {

              words =
                words.concat(
                  splitElement(el)
                );

            });



            // White quote wrapper
            var quote =
              block.querySelector(
                "[data-ftx-quote]"
              );



            // Number counters
            var counters =
              gsap.utils.toArray(
                block.querySelectorAll(
                  ".ftx-fig[data-ftx-count]"
                )
              )
              .map(function (el) {


                var target =
                  parseFloat(
                    el.getAttribute(
                      "data-ftx-count"
                    )
                  ) || 0;


                var prefix =
                  el.getAttribute(
                    "data-ftx-prefix"
                  ) || "";


                var suffix =
                  el.getAttribute(
                    "data-ftx-suffix"
                  ) || "";


                var state = {
                  value: 0
                };


                el.textContent =
                  prefix +
                  "0" +
                  suffix;


                return {

                  el: el,

                  target: target,

                  prefix: prefix,

                  suffix: suffix,

                  state: state

                };

              });


            return {

              block: block,

              words: words,

              quote: quote,

              counters: counters

            };

          });



        // ─────────────────────────────────────────
        // CAMERA INITIAL STATE
        // ─────────────────────────────────────────

        gsap.set(
          camera,
          {
            scale: 1,
            x: 0,
            y: 0
          }
        );


        // Reapply after reset.
        applyCameraFocus();



        gsap.set(
          background,
          {
            autoAlpha: 1
          }
        );



        // ─────────────────────────────────────────
        // FACE
        // Pure fade.
        // ─────────────────────────────────────────

        gsap.set(
          face,
          {
            autoAlpha: 0,
            x: 0,
            y: 0
          }
        );



        // ─────────────────────────────────────────
        // MONEY
        // Comes physically from below.
        // ─────────────────────────────────────────

        gsap.set(
          money,
          {
            autoAlpha: 1,
            x: 0,
            y: MONEY_START
          }
        );



        // ─────────────────────────────────────────
        // BLOCK INITIAL STATES
        // ─────────────────────────────────────────

        blockData.forEach(function (data, i) {

          gsap.set(
            data.block,
            {
              autoAlpha:
                i === 0 ? 1 : 0
            }
          );


          gsap.set(
            data.words,
            {
              autoAlpha: 0,
              yPercent: 65
            }
          );


          // White quote card starts
          // slightly down + slightly smaller.

          if (data.quote) {

            gsap.set(
              data.quote,
              {

                autoAlpha: 0,

                y:
                  QUOTE_Y,

                scale:
                  QUOTE_SCALE,

                transformOrigin:
                  "left center"

              }
            );

          }


          data.counters.forEach(
            function (counter) {

              counter.state.value = 0;

              counter.el.textContent =
                counter.prefix +
                "0" +
                counter.suffix;

            }
          );

        });



        // ─────────────────────────────────────────
        // MASTER TIMELINE
        // ─────────────────────────────────────────

        var tl =
          gsap.timeline({

            scrollTrigger: {

              trigger:
                track,

              start:
                "top top",

              end:
                "bottom bottom",

              scrub:
                0.55

            }

          });



        // ─────────────────────────────────────────
        // COUNTERS
        // ─────────────────────────────────────────

        function animateCounters(data) {

          data.counters.forEach(
            function (counter) {

              tl.to(
                counter.state,
                {

                  value:
                    counter.target,

                  duration:
                    COUNT_IN,

                  ease:
                    "power2.out",

                  onUpdate:
                    function () {

                      counter.el.textContent =
                        counter.prefix +
                        Math.round(
                          counter.state.value
                        ) +
                        counter.suffix;

                    }

                },
                "<"
              );

            }
          );

        }



        // ─────────────────────────────────────────
        // SHOW BLOCK
        // ─────────────────────────────────────────

        function showText(data) {

          tl.set(
            data.block,
            {
              autoAlpha: 1
            }
          );


          // White quote wrapper/card

          if (data.quote) {

            tl.to(
              data.quote,
              {

                autoAlpha: 1,

                y: 0,

                scale: 1,

                duration:
                  QUOTE_IN,

                ease:
                  "power3.out"

              }
            );

          }


          // Split words

          if (data.words.length) {

            tl.to(
              data.words,
              {

                autoAlpha: 1,

                yPercent: 0,

                duration:
                  WORD_IN,

                ease:
                  "power3.out",

                stagger: {
                  each:
                    WORD_STAGGER_IN
                }

              },

              data.quote
                ? "<+0.06"
                : undefined

            );

          }


          animateCounters(data);

        }



        // ─────────────────────────────────────────
        // HIDE BLOCK
        // ─────────────────────────────────────────

        function hideText(data) {

          if (data.words.length) {

            tl.to(
              data.words,
              {

                autoAlpha: 0,

                yPercent: -60,

                duration:
                  WORD_OUT,

                ease:
                  "power2.in",

                stagger: {
                  each:
                    WORD_STAGGER_OUT
                }

              }
            );

          }


          // Smoothly remove whole quote card

          if (data.quote) {

            tl.to(
              data.quote,
              {

                autoAlpha: 0,

                y: -18,

                scale:
                  QUOTE_SCALE,

                duration:
                  QUOTE_OUT,

                ease:
                  "power2.in"

              },
              "<"
            );

          }


          tl.set(
            data.block,
            {
              autoAlpha: 0
            }
          );

        }



        // ═════════════════════════════════════════
        // BLOCK 1
        // Background only
        // ═════════════════════════════════════════

        showText(
          blockData[0]
        );


        tl.to(
          {},
          {
            duration:
              TEXT_HOLD
          }
        );



        // ═════════════════════════════════════════
        // BLOCK 2
        // ═════════════════════════════════════════

        if (blockData[1]) {

          hideText(
            blockData[0]
          );


          showText(
            blockData[1]
          );

        }



        // FACE fades in.

        tl.to(
          face,
          {

            autoAlpha: 1,

            duration:
              FACE_FADE,

            ease:
              "power2.out"

          }
        );



        // MONEY waits until face
        // has completely finished.

        tl.to(
          money,
          {

            y: 0,

            duration:
              MONEY_IN,

            ease:
              "power3.out"

          }
        );



        tl.to(
          {},
          {
            duration:
              TEXT_HOLD
          }
        );



        // ─────────────────────────────────────────
        // CAMERA ZOOM START POINT
        //
        // Everything after this contributes
        // continuously to the zoom.
        // ─────────────────────────────────────────

        var zoomStart =
          tl.duration();



        // ═════════════════════════════════════════
        // BLOCK 3
        // ═════════════════════════════════════════

        if (blockData[2]) {

          hideText(
            blockData[1]
          );


          showText(
            blockData[2]
          );

        }


        tl.to(
          {},
          {
            duration:
              TEXT_HOLD
          }
        );



        // ═════════════════════════════════════════
        // BLOCK 4
        // ═════════════════════════════════════════

        if (blockData[3]) {

          hideText(
            blockData[2]
          );


          showText(
            blockData[3]
          );

        }


        tl.to(
          {},
          {
            duration:
              TEXT_HOLD
          }
        );



        // ═════════════════════════════════════════
        // BLOCK 5
        // ═════════════════════════════════════════

        if (blockData[4]) {

          hideText(
            blockData[3]
          );


          showText(
            blockData[4]
          );

        }



        // Money leaves independently.

        tl.to(
          money,
          {

            x:
              "-25vw",

            y:
              "20vh",

            duration:
              0.80,

            ease:
              "power2.inOut"

          },
          "<"
        );


        tl.to(
          {},
          {
            duration:
              TEXT_HOLD
          }
        );



        // ═════════════════════════════════════════
        // BLOCK 6
        // ═════════════════════════════════════════

        if (blockData[5]) {

          hideText(
            blockData[4]
          );


          showText(
            blockData[5]
          );

        }



        tl.to(
          money,
          {

            x:
              "-45vw",

            y:
              "35vh",

            duration:
              0.90,

            ease:
              "power2.in"

          },
          "<"
        );



        // Final read / final zoom keeps going.

        tl.to(
          {},
          {
            duration: 1.40
          }
        );



        // ─────────────────────────────────────────
        // CONTINUOUS CAMERA PUSH
        //
        // Insert ONE tween spanning everything
        // from Block 3 until the end.
        //
        // This means every bit of scrolling
        // continuously adds more zoom.
        // ─────────────────────────────────────────

        var zoomEnd =
          tl.duration();


        var zoomDuration =
          zoomEnd -
          zoomStart;


        tl.to(
          camera,
          {

            scale:
              FINAL_ZOOM,

            x: 0,
            y: 0,

            duration:
              zoomDuration,

            ease:
              "none"

          },
          zoomStart
        );



        // ─────────────────────────────────────────
        // RESIZE
        //
        // Recalculate where the eye centroid
        // actually lands after object-fit:cover.
        // ─────────────────────────────────────────

        function onResize() {

          applyCameraFocus();

          ScrollTrigger.refresh();

        }


        window.addEventListener(
          "resize",
          onResize
        );



        // ─────────────────────────────────────────
        // CLEANUP
        // ─────────────────────────────────────────

        return function () {

          window.removeEventListener(
            "resize",
            onResize
          );


          splits.forEach(
            function (split) {
              split.revert();
            }
          );

        };

      }
    );

  });

});

// - ASKELL -

document.addEventListener("DOMContentLoaded", function () {

  gsap.registerPlugin(ScrollTrigger);

  gsap.utils
    .toArray("[data-askell-scene]")
    .forEach(function (sec) {

      var track =
        sec.querySelector("[data-askell-track]");

      var introGroup =
        sec.querySelector("[data-askell-intro-group]");

      var title =
        sec.querySelector("[data-askell-title]");

      var body =
        sec.querySelector("[data-askell-body]");

      var person =
        sec.querySelector("[data-askell-person]");

      var personMedia =
        person
          ? person.querySelector(".askell_person-media")
          : null;

      var floats =
        gsap.utils.toArray(
          sec.querySelectorAll("[data-askell-float]")
        );

      var quotes =
        gsap.utils.toArray(
          sec.querySelectorAll("[data-askell-quote]")
        );


      if (
        !track ||
        !introGroup ||
        !title ||
        !body ||
        !person ||
        !floats.length ||
        quotes.length < 2
      ) {
        console.warn("Askell section: missing required element.");
        return;
      }


      // ─────────────────────────────────────────────
      // CONFIG
      // ─────────────────────────────────────────────

      var WORD_IN = 0.34;
      var WORD_OUT = 0.24;

      var WORD_STAGGER_IN = 0.055;
      var WORD_STAGGER_OUT = 0.03;

      var EMPTY_HOLD = 0.55;

      var TITLE_HOLD = 0.30;
      var BODY_HOLD = 0.90;

      var PERSON_IN = 0.85;

      var FLOAT_IN = 0.45;
      var FLOAT_HOLD = 1.15;
      var FLOAT_OUT = 0.60;

      var QUOTE_HOLD = 1.05;
      var QUOTE_GAP = 0.30;

      var FINAL_HOLD = 1.40;



      gsap.matchMedia().add(
        "(min-width: 992px)",
        function () {


          // ─────────────────────────────────────────
          // SPLIT TEXT
          // ─────────────────────────────────────────

          var hasSplit =
            typeof SplitText !== "undefined";


          if (hasSplit) {
            gsap.registerPlugin(SplitText);
          }


          var splits = [];


          function splitWords(el) {

            if (!el) {
              return [];
            }


            if (!hasSplit) {
              return [el];
            }


            var split =
              new SplitText(
                el,
                {
                  type: "words"
                }
              );


            splits.push(split);

            return split.words;
          }


          var titleWords =
            splitWords(title);

          var bodyWords =
            splitWords(body);



          var quote1Text =
            quotes[0].querySelector(
              "[data-askell-quote-text]"
            ) || quotes[0];


          var quote2Text =
            quotes[1].querySelector(
              "[data-askell-quote-text]"
            ) || quotes[1];


          var quote1Words =
            splitWords(quote1Text);

          var quote2Words =
            splitWords(quote2Text);



          // ─────────────────────────────────────────
          // INITIAL STATES
          // ─────────────────────────────────────────

          gsap.set(
            introGroup,
            {
              y: 0
            }
          );


          gsap.set(
            titleWords,
            {
              autoAlpha: 0,
              yPercent: 65
            }
          );


          gsap.set(
            bodyWords,
            {
              autoAlpha: 0,
              yPercent: 65
            }
          );


          // Amanda starts below viewport.
          // Final vertical position comes from Designer.
          gsap.set(
            person,
            {
              y: "110vh"
            }
          );


          // Inner visual is reserved purely
          // for recurring floating motion.
          if (personMedia) {

            gsap.set(
              personMedia,
              {
                x: 0,
                y: 0,
                rotation: 0
              }
            );

          }


          // Float wrappers handle scroll animation.
          gsap.set(
            floats,
            {
              autoAlpha: 0,
              y: 0
            }
          );


          // Quotes hidden initially.
          gsap.set(
            quotes,
            {
              autoAlpha: 0
            }
          );


          gsap.set(
            quote1Words.concat(quote2Words),
            {
              autoAlpha: 0,
              yPercent: 70
            }
          );



          // ─────────────────────────────────────────
          // AMANDA CONTINUOUS FLOAT
          // ─────────────────────────────────────────

          var personFloat = null;


          if (personMedia) {

            personFloat =
              gsap.to(
                personMedia,
                {
                  y: -12,
                  x: 5,

                  rotation: 1.35,

                  duration: 3.4,

                  ease: "sine.inOut",

                  repeat: -1,
                  yoyo: true
                }
              );

          }



          // ─────────────────────────────────────────
          // FLOATING LABEL PATHS
          // ─────────────────────────────────────────

          var floatTweens = [];


          floats.forEach(function (float, i) {

            var inner =
              float.querySelector(
                ".askell_float-inner"
              ) || float;


            var xMove;
            var yMove;
            var rotation;


            switch (i) {

              case 0:
                xMove = -13;
                yMove = -8;
                rotation = -1.5;
                break;

              case 1:
                xMove = 10;
                yMove = 12;
                rotation = 1.2;
                break;

              case 2:
                xMove = -8;
                yMove = 14;
                rotation = -1;
                break;

              case 3:
                xMove = 14;
                yMove = 8;
                rotation = 1.6;
                break;

              default:
                xMove = -10;
                yMove = -12;
                rotation = -1.3;
            }


            var tween =
              gsap.to(
                inner,
                {
                  x: xMove,
                  y: yMove,

                  rotation:
                    rotation,

                  duration:
                    2.3 + i * 0.22,

                  ease:
                    "sine.inOut",

                  repeat: -1,
                  yoyo: true
                }
              );


            floatTweens.push(tween);

          });



          // ─────────────────────────────────────────
          // MASTER TIMELINE
          // ─────────────────────────────────────────

          var tl =
            gsap.timeline({

              scrollTrigger: {

                trigger:
                  track,

                start:
                  "top top",

                end:
                  "bottom bottom",

                scrub:
                  0.5

              }

            });



          // ═════════════════════════════════════════
          // 0. BACKGROUND ONLY
          // ═════════════════════════════════════════

          tl.to(
            {},
            {
              duration:
                EMPTY_HOLD
            }
          );



          // ═════════════════════════════════════════
          // 1. TITLE WORD-SPLIT IN
          // ═════════════════════════════════════════

          tl.to(
            titleWords,
            {
              autoAlpha: 1,

              yPercent: 0,

              duration:
                WORD_IN,

              ease:
                "power3.out",

              stagger: {
                each:
                  WORD_STAGGER_IN
              }
            }
          );


          tl.to(
            {},
            {
              duration:
                TITLE_HOLD
            }
          );



          // ═════════════════════════════════════════
          // 2. BODY WORD-SPLIT IN
          // ═════════════════════════════════════════

          tl.to(
            bodyWords,
            {
              autoAlpha: 1,

              yPercent: 0,

              duration:
                WORD_IN,

              ease:
                "power3.out",

              stagger: {
                each:
                  WORD_STAGGER_IN
              }
            }
          );


          tl.to(
            {},
            {
              duration:
                BODY_HOLD
            }
          );



          // ═════════════════════════════════════════
          // 3. AMANDA RISES
          //
          // Intro group leaves upward simultaneously.
          // ═════════════════════════════════════════

          tl.to(
            person,
            {
              y: 0,

              duration:
                PERSON_IN,

              ease:
                "power3.out"
            }
          );


          tl.to(
            introGroup,
            {
              y: "-115vh",

              duration:
                PERSON_IN,

              ease:
                "power3.inOut"
            },
            "<"
          );



          // ═════════════════════════════════════════
          // 4. FLOATING LABELS FADE IN
          // ═════════════════════════════════════════

          tl.to(
            floats,
            {
              autoAlpha: 1,

              duration:
                FLOAT_IN,

              ease:
                "power2.out",

              stagger: {
                each: 0.075
              }
            },
            "<+0.35"
          );


          tl.to(
            {},
            {
              duration:
                FLOAT_HOLD
            }
          );



          // ═════════════════════════════════════════
          // 5. FLOATING LABELS LEAVE UPWARD
          // ═════════════════════════════════════════

          tl.to(
            floats,
            {
              autoAlpha: 0,

              y: "-55vh",

              duration:
                FLOAT_OUT,

              ease:
                "power2.in",

              stagger: {
                each: 0.045
              }
            }
          );



          // ═════════════════════════════════════════
          // 6. QUOTE 1
          // ═════════════════════════════════════════

          tl.set(
            quotes[0],
            {
              autoAlpha: 1
            },
            "<+0.08"
          );


          tl.to(
            quote1Words,
            {
              autoAlpha: 1,

              yPercent: 0,

              duration:
                WORD_IN,

              ease:
                "power3.out",

              stagger: {
                each:
                  WORD_STAGGER_IN
              }
            }
          );


          tl.to(
            {},
            {
              duration:
                QUOTE_HOLD
            }
          );



          // ─────────────────────────────────────────
          // QUOTE 1 LEAVES
          // ─────────────────────────────────────────

          tl.to(
            quote1Words,
            {
              autoAlpha: 0,

              yPercent: -70,

              duration:
                WORD_OUT,

              ease:
                "power2.in",

              stagger: {
                each:
                  WORD_STAGGER_OUT
              }
            }
          );


          tl.set(
            quotes[0],
            {
              autoAlpha: 0
            }
          );


          tl.to(
            {},
            {
              duration:
                QUOTE_GAP
            }
          );



          // ═════════════════════════════════════════
          // 7. QUOTE 2
          // ═════════════════════════════════════════

          tl.set(
            quotes[1],
            {
              autoAlpha: 1
            }
          );


          tl.to(
            quote2Words,
            {
              autoAlpha: 1,

              yPercent: 0,

              duration:
                WORD_IN,

              ease:
                "power3.out",

              stagger: {
                each:
                  WORD_STAGGER_IN
              }
            }
          );


          // Final composition hold.
          tl.to(
            {},
            {
              duration:
                FINAL_HOLD
            }
          );



          // ─────────────────────────────────────────
          // CLEANUP
          // ─────────────────────────────────────────

          return function () {

            if (personFloat) {
              personFloat.kill();
            }


            floatTweens.forEach(
              function (tween) {
                tween.kill();
              }
            );


            splits.forEach(
              function (split) {
                split.revert();
              }
            );

          };

        }
      );

    });

});

// - where is claude

document.addEventListener("DOMContentLoaded", function () {

  gsap.registerPlugin(ScrollTrigger);

  gsap.utils
    .toArray("[data-claude-scene]")
    .forEach(function (sec) {

      var track =
        sec.querySelector("[data-claude-track]");

      var listGroup =
        sec.querySelector("[data-claude-list]");

      var lines =
        gsap.utils.toArray(
          sec.querySelectorAll("[data-claude-line]")
        );

      var finalGroup =
        sec.querySelector("[data-claude-final]");

      var finalMain =
        sec.querySelector("[data-claude-final-main]");

      var finalQuestion =
        sec.querySelector("[data-claude-final-question]");

      var finalAnswer =
        sec.querySelector("[data-claude-final-answer]");

      var finalPrefix =
        sec.querySelector(".claude_final-prefix");

      var finalHit =
        sec.querySelector(".claude_final-hit");


      if (
        !track ||
        !listGroup ||
        lines.length < 4 ||
        !finalGroup ||
        !finalMain ||
        !finalQuestion ||
        !finalAnswer ||
        !finalPrefix ||
        !finalHit
      ) {
        console.warn("Claude section: missing required element.");
        return;
      }



      // ─────────────────────────────────────────────
      // CONFIG
      // ─────────────────────────────────────────────

      var DIM_OPACITY = 0.10;

      var LINE_IN = 0.34;
      var LINE_HOLD = 0.55;

      var ALL_HOLD = 0.85;

      var TAKEOVER = 0.85;

      var WORD_IN = 0.34;
      var WORD_OUT = 0.22;

      var WORD_STAGGER = 0.05;

      var MAIN_HOLD = 0.75;
      var QUESTION_HOLD = 0.70;
      var PREFIX_HOLD = 0.30;

      var FINAL_HOLD = 1.40;



      gsap.matchMedia().add(
        "(min-width: 992px)",
        function () {


          // ─────────────────────────────────────────
          // SPLIT TEXT
          // ─────────────────────────────────────────

          var hasSplit =
            typeof SplitText !== "undefined";


          if (hasSplit) {
            gsap.registerPlugin(SplitText);
          }


          var splits = [];


          function splitWords(el) {

            if (!el) {
              return [];
            }


            if (!hasSplit) {
              return [el];
            }


            var split =
              new SplitText(
                el,
                {
                  type: "words"
                }
              );


            splits.push(split);

            return split.words;

          }



          var mainWords =
            splitWords(finalMain);

          var questionWords =
            splitWords(finalQuestion);

          var prefixWords =
            splitWords(finalPrefix);

          var hitWords =
            splitWords(finalHit);



          // ─────────────────────────────────────────
          // INITIAL STATES
          // ─────────────────────────────────────────


          // Every Claude line starts dimmed.
          gsap.set(
            lines,
            {
              opacity:
                DIM_OPACITY,

              x: 10
            }
          );


          // Final takeover starts below screen.
          gsap.set(
            finalGroup,
            {
              y: "110vh"
            }
          );


          // All final copy starts hidden.
          gsap.set(
            mainWords
              .concat(
                questionWords,
                prefixWords,
                hitWords
              ),
            {
              autoAlpha: 0,
              yPercent: 65
            }
          );



          // ─────────────────────────────────────────
          // MASTER TIMELINE
          // ─────────────────────────────────────────

          var tl =
            gsap.timeline({

              scrollTrigger: {

                trigger:
                  track,

                start:
                  "top top",

                end:
                  "bottom bottom",

                scrub:
                  0.5

              }

            });



          // ═════════════════════════════════════════
          // 0. INITIAL STATE
          //
          // "WHERE IS CLAUDE?"
          // visible.
          //
          // All lines dim.
          // ═════════════════════════════════════════

          tl.to(
            {},
            {
              duration: 0.55
            }
          );



          // ═════════════════════════════════════════
          // 1–4. ACTIVATE EACH LINE
          // ═════════════════════════════════════════

          lines.forEach(function (line) {

            tl.to(
              line,
              {

                opacity: 1,

                x: 0,

                duration:
                  LINE_IN,

                ease:
                  "power2.out"

              }
            );


            // Small reading beat before
            // next line activates.

            tl.to(
              {},
              {
                duration:
                  LINE_HOLD
              }
            );

          });



          // ═════════════════════════════════════════
          // ALL FOUR ARE NOW ACTIVE
          // ═════════════════════════════════════════

          tl.to(
            {},
            {
              duration:
                ALL_HOLD
            }
          );



          // ═════════════════════════════════════════
          // TAKEOVER
          //
          // Old list physically leaves upward.
          //
          // Final group physically comes from below.
          //
          // No fades.
          // ═════════════════════════════════════════

          tl.to(
            listGroup,
            {

              y:
                "-115vh",

              duration:
                TAKEOVER,

              ease:
                "power3.inOut"

            }
          );


          tl.to(
            finalGroup,
            {

              y: 0,

              duration:
                TAKEOVER,

              ease:
                "power3.inOut"

            },
            "<"
          );



          // ═════════════════════════════════════════
          // FINAL MAIN STATEMENT
          //
          // "The values they write..."
          // ═════════════════════════════════════════

          tl.to(
            mainWords,
            {

              autoAlpha: 1,

              yPercent: 0,

              duration:
                WORD_IN,

              ease:
                "power3.out",

              stagger: {
                each:
                  WORD_STAGGER
              }

            }
          );


          tl.to(
            {},
            {
              duration:
                MAIN_HOLD
            }
          );



          // ═════════════════════════════════════════
          // QUESTION
          //
          // "Do you want these people..."
          // ═════════════════════════════════════════

          tl.to(
            questionWords,
            {

              autoAlpha: 1,

              yPercent: 0,

              duration:
                WORD_IN,

              ease:
                "power3.out",

              stagger: {
                each:
                  WORD_STAGGER
              }

            }
          );


          tl.to(
            {},
            {
              duration:
                QUESTION_HOLD
            }
          );



          // ═════════════════════════════════════════
          // "BECAUSE THEY HAVE"
          // ═════════════════════════════════════════

          tl.to(
            prefixWords,
            {

              autoAlpha: 1,

              yPercent: 0,

              duration:
                WORD_IN,

              ease:
                "power3.out",

              stagger: {
                each:
                  WORD_STAGGER
              }

            }
          );


          tl.to(
            {},
            {
              duration:
                PREFIX_HOLD
            }
          );



          // ═════════════════════════════════════════
          // ALREADY STARTED.
          //
          // Separate, harder final hit.
          // ═════════════════════════════════════════

          tl.to(
            hitWords,
            {

              autoAlpha: 1,

              yPercent: 0,

              duration:
                0.42,

              ease:
                "power4.out",

              stagger: {
                each: 0.08
              }

            }
          );



          // ═════════════════════════════════════════
          // FINAL HOLD
          // ═════════════════════════════════════════

          tl.to(
            {},
            {
              duration:
                FINAL_HOLD
            }
          );



          // ─────────────────────────────────────────
          // CLEANUP
          // ─────────────────────────────────────────

          return function () {

            splits.forEach(
              function (split) {
                split.revert();
              }
            );

          };

        }
      );

    });

});

// ── FAMILY ──────────────────────────────────────────────
// Vertical scroll driving a horizontal transform. The page
// never scrolls sideways. fam_track is tall, fam_sticky is
// viewport-sized, and fam_rail slides inside it.
//
// As each card passes the centre it scales up and its role
// text fades in. The others sit smaller and dimmer, so you
// read one card at a time at a size that works.
//
// Designer: fam_track height 700vh. fam_rail has no width,
// flex sizes it. Card tilt goes on a combo class so GSAP's
// scale does not fight it.
// Check: 6 cards and 6 roles.
document.addEventListener("DOMContentLoaded", function () {

  gsap.registerPlugin(ScrollTrigger);

  if (typeof SplitText !== "undefined") {
    gsap.registerPlugin(SplitText);
  }

  gsap.utils
    .toArray("[data-fam-scene]")
    .forEach(function (sec) {

      var q = gsap.utils.selector(sec);

      var track = q("[data-fam-track]")[0];
      var rail = q("[data-fam-rail]")[0];
      var band = q("[data-fam-band]")[0];

      var cards = q("[data-fam-card]");
      var items = q("[data-fam-item]");

      var title =
        q("[data-fam-title]")[0] ||
        items[0];

      var quote =
        q("[data-fam-quote]")[0] ||
        items[1];

      if (
        !track ||
        !rail ||
        !band ||
        !cards.length ||
        !title ||
        !quote
      ) {
        console.warn("Family section missing:", {
          track,
          rail,
          band,
          cards: cards.length,
          title,
          quote
        });

        return;
      }


      // ------------------------------------------------
      // CONFIG
      // ------------------------------------------------

      var END_GUTTER = 48;

      var WORD_DURATION = 0.32;
      var WORD_STAGGER = 0.05;

      var TITLE_HOLD = 0.35;
      var QUOTE_HOLD = 0.55;

      var ROW_DURATION = 0.75;
      var ROW_HOLD = 0.30;

      var HORIZONTAL_DURATION = 2.8;
      var FINAL_HOLD = 0.5;



      gsap.matchMedia().add(
        "(min-width: 992px)",
        function () {

          var splits = [];


          // ------------------------------------------------
          // SPLIT TEXT
          // ------------------------------------------------

          function makeWords(el) {

            if (typeof SplitText === "undefined") {
              return [el];
            }

            var split = new SplitText(el, {
              type: "words"
            });

            splits.push(split);

            return split.words;
          }


          var titleWords = makeWords(title);
          var quoteWords = makeWords(quote);



          // ------------------------------------------------
          // CLEAN BASE STATES
          // ------------------------------------------------

          gsap.set(rail, {
            x: 0,
            y: 0
          });

          gsap.set(band, {
            y: 0
          });


          // Cards remain completely untouched.
          // No focus.
          // No scaling.
          // No opacity animation.

          gsap.set(cards, {
            opacity: 1,
            scale: 1
          });


          // If old code ever touched these,
          // make sure they're visible.

          gsap.set(q("[data-fam-role]"), {
            opacity: 1
          });



          // ------------------------------------------------
          // CALCULATE ACTUAL HORIZONTAL TRAVEL
          // ------------------------------------------------
          //
          // NO 100vw padding required.
          //
          // We calculate:
          //
          // actual last-card right position
          // minus
          // desired right edge.
          //
          // ------------------------------------------------

          function getHorizontalEnd() {

            var lastCard =
              cards[cards.length - 1];

            if (!lastCard) return 0;


            // Temporarily reason about the rail
            // as if x = 0.
            var currentX =
              parseFloat(
                gsap.getProperty(rail, "x")
              ) || 0;


            var rect =
              lastCard.getBoundingClientRect();


            var lastRightAtZero =
              rect.right - currentX;


            var desiredRight =
              window.innerWidth - END_GUTTER;


            var distance =
              desiredRight - lastRightAtZero;


            return Math.min(0, distance);
          }



          // ------------------------------------------------
          // TIMELINE
          // ------------------------------------------------

          var tl = gsap.timeline({

            scrollTrigger: {

              trigger: track,

              start: "top top",

              end: "bottom bottom",

              scrub: 0.5,

              invalidateOnRefresh: true,

              // Uncomment while debugging if wanted:
              // markers: true,

              onRefresh: function () {
                // make sure dynamic endpoint
                // gets recalculated cleanly
              }

            }

          });



          // =================================================
          // 1. TITLE
          // =================================================

          tl.fromTo(
            titleWords,

            {
              autoAlpha: 0,
              yPercent: 65
            },

            {
              autoAlpha: 1,
              yPercent: 0,

              duration: WORD_DURATION,

              stagger: {
                each: WORD_STAGGER
              },

              ease: "power3.out",

              immediateRender: true
            }
          );



          tl.to({}, {
            duration: TITLE_HOLD
          });



          // =================================================
          // 2. QUOTE
          // =================================================

          tl.fromTo(
            quoteWords,

            {
              autoAlpha: 0,
              yPercent: 65
            },

            {
              autoAlpha: 1,
              yPercent: 0,

              duration: WORD_DURATION,

              stagger: {
                each: WORD_STAGGER
              },

              ease: "power3.out",

              immediateRender: true
            }
          );



          tl.to({}, {
            duration: QUOTE_HOLD
          });



          // =================================================
          // 3. CARDS + BAND COME FROM BELOW
          // =================================================
          //
          // fromTo is deliberate here.
          //
          // This guarantees that before this point
          // they're below the viewport.
          //
          // =================================================

          tl.fromTo(
            rail,

            {
              y: "105vh"
            },

            {
              y: 0,

              duration: ROW_DURATION,

              ease: "power3.out",

              immediateRender: true
            }
          );


          tl.fromTo(
            band,

            {
              y: "105vh"
            },

            {
              y: 0,

              duration: ROW_DURATION,

              ease: "power3.out",

              immediateRender: true
            },

            "<"
          );



          tl.to({}, {
            duration: ROW_HOLD
          });



          // =================================================
          // 4. HORIZONTAL SCROLL
          // =================================================

          tl.to(
            rail,

            {
              x: function () {
                return getHorizontalEnd();
              },

              duration: HORIZONTAL_DURATION,

              ease: "none"
            }
          );



          // =================================================
          // 5. END HOLD
          // =================================================

          tl.to({}, {
            duration: FINAL_HOLD
          });



          // ------------------------------------------------
          // REFRESH AFTER EVERYTHING HAS BEEN MEASURED
          // ------------------------------------------------

          requestAnimationFrame(function () {
            ScrollTrigger.refresh();
          });



          // ------------------------------------------------
          // CLEANUP
          // ------------------------------------------------

          return function () {

            splits.forEach(function (split) {
              split.revert();
            });

            gsap.set(rail, {
              clearProps: "transform"
            });

            gsap.set(band, {
              clearProps: "transform"
            });

          };

        }
      );

    });

});

document.addEventListener("DOMContentLoaded", function () {

  gsap.registerPlugin(ScrollTrigger);

  


  gsap.utils
    .toArray("[data-scandal-scene]")
    .forEach(function (sec) {

      // =============================================
      // ELEMENTS
      // =============================================

      var cards =
        gsap.utils.toArray(
          sec.querySelectorAll("[data-scandal-card]")
        );

      var reader =
        sec.querySelector("[data-scandal-reader]");

      var readerVisual =
        reader?.querySelector(".scandal_reader-visual");

      var readerContent =
        reader?.querySelector(".scandal_reader-content");

      var readerScroll =
        reader?.querySelector(".scandal_reader-scroll");

      var readerImage =
        reader?.querySelector("[data-scandal-reader-image]");

      var closeBtn =
        reader?.querySelector("[data-scandal-close]");

      var prevBtn =
        reader?.querySelector("[data-scandal-prev]");

      var nextBtn =
        reader?.querySelector("[data-scandal-next]");

      var stories =
        reader
          ? gsap.utils.toArray(
              reader.querySelectorAll("[data-scandal-story]")
            )
          : [];

          var intro =
  sec.querySelector("[data-scandal-intro]");

var introTrack =
  sec.querySelector("[data-scandal-track]");

      if (
        !cards.length ||
        !reader ||
        !readerVisual ||
        !readerContent ||
        !readerImage ||
        !closeBtn ||
        !stories.length
      ) {

        console.warn(
          "Scandals section: missing required elements.",
          {
            cards: cards.length,
            reader: reader,
            readerVisual: readerVisual,
            readerContent: readerContent,
            readerImage: readerImage,
            closeBtn: closeBtn,
            stories: stories.length
          }
        );

        return;
      }

      


      // =============================================
      // STATE
      // =============================================

      var currentCard = null;
      var currentStory = null;
      var currentIndex = -1;

      var isOpen = false;
      var isAnimating = false;

      var oldBodyOverflow = "";
      var oldHtmlOverflow = "";



      // =============================================
      // INITIAL STATE
      // =============================================

      reader.setAttribute(
        "aria-hidden",
        "true"
      );


      gsap.set(reader, {
        autoAlpha: 0,
        pointerEvents: "none"
      });

      


      gsap.set(stories, {
        display: "none"
      });

      // =============================================
// SCANDALS INTRO FADE
// =============================================

if (intro && introTrack) {

  gsap.to(intro, {
    autoAlpha: 0,
    ease: "none",

    scrollTrigger: {
      trigger: introTrack,
      start: "top top",
      end: "+=1000",
      scrub: true
    }
  });

}

      cards.forEach(function (card) {

        card.setAttribute(
          "role",
          "button"
        );

        card.setAttribute(
          "tabindex",
          "0"
        );

      });



      // =============================================
      // HELPERS
      // =============================================

      function getStoryForCard(card) {

        var id =
          card.getAttribute("data-story");


        return stories.find(
          function (story) {

            return (
              story.getAttribute(
                "data-scandal-story"
              ) === id
            );

          }
        );

      }



      function getCardImage(card) {

        return card.querySelector(
          "[data-scandal-image]"
        );

      }



      function setReaderImage(card) {

        var source =
          getCardImage(card);


        if (!source) {
          return;
        }


        var src =
          source.currentSrc ||
          source.src;


        if (src) {
          readerImage.src = src;
        }


        readerImage.alt =
          source.alt || "";


        var styles =
          window.getComputedStyle(source);


        readerImage.style.objectPosition =
          styles.objectPosition;

      }



      function lockPage() {

        oldBodyOverflow =
          document.body.style.overflow;

        oldHtmlOverflow =
          document.documentElement.style.overflow;


        document.body.style.overflow =
          "hidden";

        document.documentElement.style.overflow =
          "hidden";

      }



      function unlockPage() {

        document.body.style.overflow =
          oldBodyOverflow;

        document.documentElement.style.overflow =
          oldHtmlOverflow;

      }



      function activateStory(story) {

        stories.forEach(function (item) {

          item.classList.remove(
            "is-active"
          );


          gsap.set(item, {
            display: "none"
          });

        });


        story.classList.add(
          "is-active"
        );


        gsap.set(story, {
          display: "block"
        });

      }



      // =============================================
      // FLYING IMAGE
      // =============================================
      //
      // Creates a temporary copy of an image.
      //
      // IMPORTANT:
      // We animate width + height,
      // NOT scaleX + scaleY.
      //
      // object-fit: cover means the artwork
      // keeps its natural proportions.
      //
      // =============================================

      function createFlyingImage(source, rect) {

        if (!source) {
          return null;
        }


        var styles =
          window.getComputedStyle(source);


        var clone =
          document.createElement("img");


        clone.src =
          source.currentSrc ||
          source.src;


        clone.alt = "";


        Object.assign(
          clone.style,
          {

            position:
              "fixed",

            left:
              rect.left + "px",

            top:
              rect.top + "px",

            width:
              rect.width + "px",

            height:
              rect.height + "px",

            objectFit:
              "cover",

            objectPosition:
              styles.objectPosition,

            margin:
              "0",

            padding:
              "0",

            border:
              "0",

            zIndex:
              "99999",

            pointerEvents:
              "none",

            willChange:
              "left, top, width, height",

            transform:
              "none"

          }
        );


        document.body.appendChild(
          clone
        );


        return clone;

      }



      // =============================================
      // OPEN STORY
      // =============================================

      function openStory(card) {

        if (
          isAnimating ||
          isOpen
        ) {
          return;
        }


        var story =
          getStoryForCard(card);


        var sourceImage =
          getCardImage(card);


        if (
          !story ||
          !sourceImage
        ) {

          console.warn(
            "Scandal card missing story/image:",
            card
          );

          return;
        }


        isAnimating = true;

        currentCard = card;
        currentStory = story;
        currentIndex = cards.indexOf(card);



        // ---------------------------------------------
        // PREPARE READER
        // ---------------------------------------------

        setReaderImage(card);
        activateStory(story);


        if (readerScroll) {
          readerScroll.scrollTop = 0;
        }


        reader.classList.add(
          "is-open"
        );


        reader.setAttribute(
          "aria-hidden",
          "false"
        );


        gsap.set(reader, {
          autoAlpha: 1,
          pointerEvents: "auto"
        });


        lockPage();



        // ---------------------------------------------
        // MEASURE
        // ---------------------------------------------

        var sourceRect =
          sourceImage.getBoundingClientRect();


        var targetRect =
          readerVisual.getBoundingClientRect();



        // ---------------------------------------------
        // FLYING CLONE
        // ---------------------------------------------

        var flyingImage =
          createFlyingImage(
            sourceImage,
            sourceRect
          );



        // Hide real left panel until clone arrives.

        gsap.set(
          readerVisual,
          {
            autoAlpha: 0
          }
        );


        // Right side waits off-screen.

        gsap.set(
          readerContent,
          {
            xPercent: 100
          }
        );


        gsap.set(
          currentStory,
          {
            autoAlpha: 0,
            y: 30
          }
        );


        gsap.set(
          closeBtn,
          {
            autoAlpha: 0,
            scale: 0.8
          }
        );



        // =============================================
        // OPEN TIMELINE
        // =============================================

        var tl =
          gsap.timeline({

            onComplete:
              function () {

                // Swap clone → real reader artwork.

                gsap.set(
                  readerVisual,
                  {
                    autoAlpha: 1
                  }
                );


                if (flyingImage) {
                  flyingImage.remove();
                }


                isOpen = true;
                isAnimating = false;

              }

          });



        // ---------------------------------------------
        // IMAGE EXPANDS
        // ---------------------------------------------

        if (flyingImage) {

          tl.to(
            flyingImage,
            {

              left:
                targetRect.left,

              top:
                targetRect.top,

              width:
                targetRect.width,

              height:
                targetRect.height,

              duration:
                0.75,

              ease:
                "power4.inOut"

            },

            0
          );

        }



        // ---------------------------------------------
        // RIGHT PANEL
        // ---------------------------------------------

        tl.to(
          readerContent,
          {

            xPercent: 0,

            duration:
              0.72,

            ease:
              "power4.inOut"

          },

          0.08
        );



        // ---------------------------------------------
        // STORY
        // ---------------------------------------------

        tl.to(
          currentStory,
          {

            autoAlpha: 1,
            y: 0,

            duration:
              0.45,

            ease:
              "power3.out"

          },

          0.38
        );



        // ---------------------------------------------
        // CLOSE BUTTON
        // ---------------------------------------------

        tl.to(
          closeBtn,
          {

            autoAlpha: 1,
            scale: 1,

            duration:
              0.3,

            ease:
              "back.out(1.8)"

          },

          0.50
        );

      }



      // =============================================
      // CLOSE STORY
      // =============================================

      function closeStory() {

        if (
          !isOpen ||
          isAnimating ||
          !currentCard
        ) {
          return;
        }


        var targetImage =
          getCardImage(
            currentCard
          );


        if (!targetImage) {
          return;
        }


        isAnimating = true;



        // ---------------------------------------------
        // MEASURE
        // ---------------------------------------------

        var startRect =
          readerVisual.getBoundingClientRect();


        var targetRect =
          targetImage.getBoundingClientRect();



        // ---------------------------------------------
        // CLONE READER IMAGE
        // ---------------------------------------------

        var flyingImage =
          createFlyingImage(
            readerImage,
            startRect
          );



        // Hide real left panel immediately.
        // Clone visually replaces it.

        gsap.set(
          readerVisual,
          {
            autoAlpha: 0
          }
        );



        // =============================================
        // CLOSE TIMELINE
        // =============================================

        var tl =
          gsap.timeline({

            onComplete:
              function () {

                if (flyingImage) {
                  flyingImage.remove();
                }


                reader.classList.remove(
                  "is-open"
                );


                reader.setAttribute(
                  "aria-hidden",
                  "true"
                );


                gsap.set(
                  reader,
                  {
                    autoAlpha: 0,
                    pointerEvents: "none"
                  }
                );


                gsap.set(
                  readerVisual,
                  {
                    autoAlpha: 1
                  }
                );


                gsap.set(
                  readerContent,
                  {
                    xPercent: 0
                  }
                );


                if (currentStory) {

                  currentStory.classList.remove(
                    "is-active"
                  );


                  gsap.set(
                    currentStory,
                    {
                      display: "none",
                      clearProps:
                        "opacity,visibility,transform"
                    }
                  );

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

              }

          });



        // ---------------------------------------------
        // STORY OUT
        // ---------------------------------------------

        tl.to(
          currentStory,
          {

            autoAlpha: 0,
            y: 20,

            duration:
              0.22,

            ease:
              "power2.in"

          },

          0
        );



        // ---------------------------------------------
        // CLOSE BUTTON OUT
        // ---------------------------------------------

        tl.to(
          closeBtn,
          {

            autoAlpha: 0,

            duration:
              0.15

          },

          0
        );



        // ---------------------------------------------
        // RIGHT PANEL OUT
        // ---------------------------------------------

        tl.to(
          readerContent,
          {

            xPercent: 100,

            duration:
              0.58,

            ease:
              "power3.inOut"

          },

          0.08
        );



        // ---------------------------------------------
        // IMAGE CONTRACTS BACK TO CARD
        // ---------------------------------------------

        if (flyingImage) {

          tl.to(
            flyingImage,
            {

              left:
                targetRect.left,

              top:
                targetRect.top,

              width:
                targetRect.width,

              height:
                targetRect.height,

              duration:
                0.70,

              ease:
                "power4.inOut"

            },

            0.04
          );

        }

      }



      // =============================================
      // NEXT / PREVIOUS
      // =============================================

      function goToStory(index) {

        if (
          !isOpen ||
          isAnimating
        ) {
          return;
        }


        if (index < 0) {

          index =
            cards.length - 1;

        }


        if (
          index >= cards.length
        ) {

          index = 0;

        }


        if (
          index === currentIndex
        ) {
          return;
        }


        var nextCard =
          cards[index];


        var nextStory =
          getStoryForCard(
            nextCard
          );


        if (!nextStory) {
          return;
        }


        isAnimating = true;


        var oldStory =
          currentStory;



        var tl =
          gsap.timeline({

            onComplete:
              function () {

                currentIndex = index;
                currentCard = nextCard;
                currentStory = nextStory;

                isAnimating = false;

              }

          });



        // ---------------------------------------------
        // OLD CONTENT OUT
        // ---------------------------------------------

        tl.to(
          [
            oldStory,
            readerImage
          ],
          {

            autoAlpha: 0,

            duration:
              0.20,

            ease:
              "power2.in"

          }
        );



        // ---------------------------------------------
        // SWAP
        // ---------------------------------------------

        tl.call(
          function () {

            oldStory.classList.remove(
              "is-active"
            );


            gsap.set(
              oldStory,
              {
                display: "none"
              }
            );


            setReaderImage(
              nextCard
            );


            activateStory(
              nextStory
            );


            if (readerScroll) {
              readerScroll.scrollTop = 0;
            }


            gsap.set(
              nextStory,
              {

                autoAlpha: 0,
                y: 25

              }
            );


            gsap.set(
              readerImage,
              {

                autoAlpha: 0,
                scale: 1.025

              }
            );

          }
        );



        // ---------------------------------------------
        // NEW IMAGE
        // ---------------------------------------------

        tl.to(
          readerImage,
          {

            autoAlpha: 1,
            scale: 1,

            duration:
              0.42,

            ease:
              "power3.out"

          }
        );



        // ---------------------------------------------
        // NEW STORY
        // ---------------------------------------------

        tl.to(
          nextStory,
          {

            autoAlpha: 1,
            y: 0,

            duration:
              0.40,

            ease:
              "power3.out"

          },

          "<0.08"
        );

      }



      // =============================================
      // CARD EVENTS
      // =============================================

      cards.forEach(
        function (card) {

          card.addEventListener(
            "click",
            function (event) {

              event.preventDefault();

              openStory(card);

            }
          );


          card.addEventListener(
            "keydown",
            function (event) {

              if (
                event.key === "Enter" ||
                event.key === " "
              ) {

                event.preventDefault();

                openStory(card);

              }

            }
          );

        }
      );



      // =============================================
      // CLOSE
      // =============================================

      closeBtn.addEventListener(
        "click",
        function (event) {

          event.preventDefault();

          closeStory();

        }
      );



      // =============================================
      // PREVIOUS
      // =============================================

      if (prevBtn) {

        prevBtn.addEventListener(
          "click",
          function (event) {

            event.preventDefault();

            goToStory(
              currentIndex - 1
            );

          }
        );

      }



      // =============================================
      // NEXT
      // =============================================

      if (nextBtn) {

        nextBtn.addEventListener(
          "click",
          function (event) {

            event.preventDefault();

            goToStory(
              currentIndex + 1
            );

          }
        );

      }



      // =============================================
      // ESCAPE KEY
      // =============================================

      document.addEventListener(
        "keydown",
        function (event) {

          if (
            event.key === "Escape" &&
            isOpen
          ) {

            closeStory();

          }

        }
      );

    });

});

document.addEventListener("DOMContentLoaded", function () {


  gsap.registerPlugin(ScrollTrigger);

  if (typeof SplitText !== "undefined") {
    gsap.registerPlugin(SplitText);
  }


  gsap.utils
    .toArray("[data-wash-scene]")
    .forEach(function (sec) {

      var q = gsap.utils.selector(sec);


      // =============================================
      // ELEMENTS
      // =============================================

      var track =
        q("[data-wash-track]")[0];

      var claude =
        q("[data-wash-claude]")[0];

      var capitol =
        q("[data-wash-capitol]")[0];

      var bills =
        q("[data-wash-bill]");


      var intro =
        q("[data-wash-intro]")[0];

      var title =
        q("[data-wash-title]")[0];

      var quote =
        q("[data-wash-quote]")[0];


      var counter =
        q("[data-wash-counter]")[0];

      var counterValue =
        q("[data-wash-counter-value]")[0];


      var scaleGroup =
        q("[data-wash-scale]")[0];

      var scalePrimary =
        q("[data-wash-scale-primary]")[0];

      var scaleSecondary =
        q("[data-wash-scale-secondary]")[0];


      var question =
        q("[data-wash-question]")[0];


      var fellows =
        q('[data-wash-stat="fellows"]')[0];

      var pac =
        q('[data-wash-stat="pac"]')[0];

      var pledged =
        q('[data-wash-stat="pledged"]')[0];



      if (
        !track ||
        !intro ||
        !title ||
        !quote ||
        !counter ||
        !counterValue ||
        !scalePrimary ||
        !scaleSecondary ||
        !question ||
        !fellows ||
        !pac ||
        !pledged
      ) {

        console.warn(
          "Washington section: missing required elements.",
          {
            track,
            intro,
            title,
            quote,
            counter,
            counterValue,
            scalePrimary,
            scaleSecondary,
            question,
            fellows,
            pac,
            pledged,
            bills: bills.length
          }
        );

        return;
      }



      // =============================================
      // POSITION CONFIG
      // =============================================

      /*
       * Counter starts LARGE + CENTERED.
       */

      var COUNTER_CENTER_LEFT = "50%";
      var COUNTER_CENTER_TOP = "42%";


      /*
       * Once comparison begins:
       * smaller + near top.
       *
       * LEFT is calculated dynamically from
       * the $7.5B comparison block.
       */

      var COUNTER_SMALL_TOP = "8%";
      var COUNTER_SMALL_SCALE = 0.40;


      /*
       * Comparison blocks.
       * Kept relatively close together.
       */

      var SCALE_PRIMARY_TOP = "39%";
      var SCALE_SECONDARY_TOP = "52%";


      /*
       * Everything after:
       * "What does that money buy?"
       *
       * sits 15 percentage points higher.
       */

      var LATE_TEXT_TOP = "22%";



      // =============================================
      // LIVE $32 / SECOND COUNTER
      // =============================================

      var RATE_PER_SECOND = 32;


      function updateCounter() {

        var elapsedMs =
          Date.now() -
          performance.timeOrigin;


        var elapsedSeconds =
          elapsedMs / 1000;


        var amount =
          Math.floor(
            elapsedSeconds *
            RATE_PER_SECOND
          );


        counterValue.textContent =
          "$" +
          amount.toLocaleString("en-US");

      }


      updateCounter();


      var counterInterval =
        setInterval(
          updateCounter,
          100
        );



      // =============================================
      // DESKTOP
      // =============================================

      gsap.matchMedia().add(
        "(min-width: 992px)",
        function () {


          // =========================================
          // TIMING
          // =========================================

          var WORD_IN = 0.34;
          var WORD_STAGGER = 0.05;

          var INTRO_HOLD = 0.55;
          var QUOTE_HOLD = 0.75;

          var COUNTER_IN = 0.55;
          var COUNTER_HOLD = 0.85;

          var VISUAL_IN = 0.75;
          var VISUAL_HOLD = 0.65;

          var SCALE_HOLD = 1.25;

          var QUESTION_HOLD = 0.80;

          var STAT_IN = 0.45;
          var STAT_HOLD = 0.90;

          var FINAL_HOLD = 1.40;



          // =========================================
          // SPLIT TEXT
          // =========================================

          var splits = [];


          function splitWords(el) {

            if (
              !el ||
              typeof SplitText === "undefined"
            ) {
              return [el];
            }


            var split =
              new SplitText(
                el,
                {
                  type: "words"
                }
              );


            splits.push(split);

            return split.words;

          }


          var titleWords =
            splitWords(title);

          var quoteWords =
            splitWords(quote);

          var questionWords =
            splitWords(question);



          // =========================================
          // COMPARISON LEFT EDGE
          // =========================================
          //
          // Finds where $7.5B actually sits
          // inside the counter's positioning context.
          //
          // This means you can reposition $7.5B
          // in Designer and the counter follows it.
          //
          // =========================================

          function getComparisonLeft() {

            var scaleRect =
              scalePrimary.getBoundingClientRect();


            var counterParent =
              counter.offsetParent;


            if (!counterParent) {
              return scaleRect.left + "px";
            }


            var parentRect =
              counterParent.getBoundingClientRect();


            return (
              scaleRect.left -
              parentRect.left
            ) + "px";

          }



          // =========================================
          // POSITION OVERRIDES
          // =========================================

          gsap.set(
            scalePrimary,
            {
              top:
                SCALE_PRIMARY_TOP
            }
          );


          gsap.set(
            scaleSecondary,
            {
              top:
                SCALE_SECONDARY_TOP
            }
          );


          gsap.set(
            question,
            {
              top:
                LATE_TEXT_TOP
            }
          );


          gsap.set(
            [
              fellows,
              pac,
              pledged
            ],
            {
              top:
                LATE_TEXT_TOP
            }
          );



          // =========================================
          // INITIAL STATES
          // =========================================


          // -----------------------------------------
          // TITLE
          // -----------------------------------------

          gsap.set(
            titleWords,
            {
              autoAlpha: 0,
              yPercent: 65
            }
          );



          // -----------------------------------------
          // QUOTE
          // -----------------------------------------

          gsap.set(
            quoteWords,
            {
              autoAlpha: 0,
              yPercent: 65
            }
          );



          // -----------------------------------------
          // COUNTER
          //
          // Starts hidden,
          // large,
          // centered.
          // -----------------------------------------

          gsap.set(
            counter,
            {
              autoAlpha: 0,

              left:
                COUNTER_CENTER_LEFT,

              top:
                COUNTER_CENTER_TOP,

              x: 0,
              y: 0,

              xPercent: -50,
              yPercent: -50,

              scale: 1,

              transformOrigin:
                "center center"
            }
          );



          // -----------------------------------------
          // CAPITOL
          // -----------------------------------------

          if (capitol) {

            gsap.set(
              capitol,
              {
                yPercent: 100,
                autoAlpha: 0
              }
            );

          }



          // -----------------------------------------
          // CLAUDE
          // -----------------------------------------

          if (claude) {

            gsap.set(
              claude,
              {
                autoAlpha: 0,
                scale: 0.72,
                rotation: -8
              }
            );

          }



          // -----------------------------------------
          // BILLS
          // -----------------------------------------

          bills.forEach(
            function (bill, i) {

              var rotations =
                [-16, 13, -8];

              var xs =
                [-70, 45, 80];


              gsap.set(
                bill,
                {
                  autoAlpha: 0,

                  y: "-40vh",

                  x:
                    xs[
                      i % xs.length
                    ],

                  rotation:
                    rotations[
                      i % rotations.length
                    ]
                }
              );

            }
          );



          // -----------------------------------------
          // SCALE COMPARISON
          // -----------------------------------------

          if (scaleGroup) {

            gsap.set(
              scaleGroup,
              {
                autoAlpha: 1
              }
            );

          }


          gsap.set(
            scalePrimary,
            {
              autoAlpha: 0,
              y: 35
            }
          );


          gsap.set(
            scaleSecondary,
            {
              autoAlpha: 0,
              y: 35
            }
          );



          // -----------------------------------------
          // QUESTION
          // -----------------------------------------

          gsap.set(
            questionWords,
            {
              autoAlpha: 0,
              yPercent: 70
            }
          );



          // -----------------------------------------
          // LATER STATS
          // -----------------------------------------

          gsap.set(
            [
              fellows,
              pac,
              pledged
            ],
            {
              autoAlpha: 0,
              y: 45
            }
          );



          // =========================================
          // SUBTLE BILL FLOAT
          // =========================================

          var floatTweens = [];


          bills.forEach(
            function (bill, i) {

              var img =
                bill.querySelector("img");


              if (!img) {
                return;
              }


              var tween =
                gsap.to(
                  img,
                  {
                    x:
                      i % 2 === 0
                        ? 8
                        : -8,

                    y:
                      -10 - i * 2,

                    rotation:
                      i % 2 === 0
                        ? 2
                        : -2,

                    duration:
                      2.8 + i * 0.35,

                    ease:
                      "sine.inOut",

                    repeat: -1,
                    yoyo: true
                  }
                );


              floatTweens.push(
                tween
              );

            }
          );



          // =========================================
          // MASTER TIMELINE
          // =========================================

          var tl =
            gsap.timeline({

              scrollTrigger: {

                trigger:
                  track,

                start:
                  "top top",

                end:
                  "bottom bottom",

                scrub:
                  0.55,

                invalidateOnRefresh:
                  true

              }

            });



          // =========================================
          // 01 — TITLE
          // =========================================

          tl.to(
            titleWords,
            {
              autoAlpha: 1,
              yPercent: 0,

              duration:
                WORD_IN,

              stagger: {
                each:
                  WORD_STAGGER
              },

              ease:
                "power3.out"
            }
          );


          tl.to(
            {},
            {
              duration:
                INTRO_HOLD
            }
          );



          // =========================================
          // 02 — QUOTE
          // =========================================

          tl.to(
            quoteWords,
            {
              autoAlpha: 1,
              yPercent: 0,

              duration:
                WORD_IN,

              stagger: {
                each: 0.035
              },

              ease:
                "power3.out"
            }
          );


          tl.to(
            {},
            {
              duration:
                QUOTE_HOLD
            }
          );



          // =========================================
          // INTRO OUT
          // =========================================

          tl.to(
            intro,
            {
              autoAlpha: 0,

              y: "-18vh",

              duration:
                0.50,

              ease:
                "power3.in"
            }
          );



          // =========================================
          // 03 — LIVE COUNTER
          //
          // BIG + CENTERED
          // =========================================

          tl.to(
            counter,
            {
              autoAlpha: 1,

              duration:
                COUNTER_IN,

              ease:
                "power3.out"
            },

            "<0.15"
          );


          tl.to(
            {},
            {
              duration:
                COUNTER_HOLD
            }
          );



          // =========================================
          // 04 — CAPITOL RISES
          // =========================================

          if (capitol) {

            tl.to(
              capitol,
              {
                autoAlpha: 1,

                yPercent: 0,

                duration:
                  VISUAL_IN,

                ease:
                  "power3.out"
              }
            );

          }



          // =========================================
          // BILLS
          // =========================================

          bills.forEach(
            function (bill, i) {

              tl.to(
                bill,
                {
                  autoAlpha: 1,

                  y: 0,
                  x: 0,

                  rotation: 0,

                  duration:
                    0.65,

                  ease:
                    "power3.out"
                },

                capitol
                  ? "<" + (0.08 + i * 0.09)
                  : "<" + (i * 0.09)

              );

            }
          );



          // =========================================
          // CLAUDE
          // =========================================

          if (claude) {

            tl.to(
              claude,
              {
                autoAlpha: 1,

                scale: 1,
                rotation: 0,

                duration:
                  0.60,

                ease:
                  "power3.out"
              },

              "<0.18"
            );

          }


          tl.to(
            {},
            {
              duration:
                VISUAL_HOLD
            }
          );



          // =========================================
          // 05 — COUNTER SHRINKS + ALIGNS
          //
          // Exact same LEFT EDGE as $7.5B.
          //
          // Scroll backward automatically:
          //
          // comparison position
          // ↓
          // center / large
          // ↓
          // hidden
          // =========================================

          tl.to(
            counter,
            {
              left:
                getComparisonLeft,

              top:
                COUNTER_SMALL_TOP,

              xPercent: 0,
              yPercent: 0,

              scale:
                COUNTER_SMALL_SCALE,

              transformOrigin:
                "top left",

              duration:
                0.72,

              ease:
                "power4.inOut"
            }
          );



          // =========================================
          // $7.5 BILLION+
          // =========================================

          tl.to(
            scalePrimary,
            {
              autoAlpha: 1,
              y: 0,

              duration:
                0.55,

              ease:
                "power3.out"
            },

            "<0.25"
          );



          // =========================================
          // $1 BILLION+
          // =========================================

          tl.to(
            scaleSecondary,
            {
              autoAlpha: 1,
              y: 0,

              duration:
                0.48,

              ease:
                "power3.out"
            },

            "<0.20"
          );


          tl.to(
            {},
            {
              duration:
                SCALE_HOLD
            }
          );



          // =========================================
          // COMPARISON OUT
          //
          // IMPORTANT:
          // Counter stays visible.
          // =========================================

          tl.to(
            [
              scalePrimary,
              scaleSecondary
            ],
            {
              autoAlpha: 0,

              y: -30,

              duration:
                0.35,

              ease:
                "power2.in"
            }
          );



          // =========================================
          // 06 — WHAT DOES THAT MONEY BUY?
          //
          // Positioned 15% higher.
          // =========================================

          tl.to(
            questionWords,
            {
              autoAlpha: 1,
              yPercent: 0,

              duration:
                WORD_IN,

              stagger: {
                each:
                  WORD_STAGGER
              },

              ease:
                "power3.out"
            }
          );


          tl.to(
            {},
            {
              duration:
                QUESTION_HOLD
            }
          );


          tl.to(
            questionWords,
            {
              autoAlpha: 0,

              yPercent: -50,

              duration:
                0.28,

              stagger: {
                each: 0.02
              },

              ease:
                "power2.in"
            }
          );



          // =========================================
          // 07 — 80+ FELLOWS
          // =========================================

          tl.to(
            fellows,
            {
              autoAlpha: 1,
              y: 0,

              duration:
                STAT_IN,

              ease:
                "power3.out"
            }
          );


          tl.to(
            {},
            {
              duration:
                STAT_HOLD
            }
          );


          tl.to(
            fellows,
            {
              autoAlpha: 0,

              y: -40,

              duration:
                0.35,

              ease:
                "power2.in"
            }
          );



          // =========================================
          // 08 — $55.14M
          // =========================================

          tl.to(
            pac,
            {
              autoAlpha: 1,
              y: 0,

              duration:
                STAT_IN,

              ease:
                "power3.out"
            }
          );


          tl.to(
            {},
            {
              duration:
                STAT_HOLD
            }
          );


          tl.to(
            pac,
            {
              autoAlpha: 0,

              y: -40,

              duration:
                0.35,

              ease:
                "power2.in"
            }
          );



          // =========================================
          // 09 — $39.2B
          // =========================================

          tl.to(
            pledged,
            {
              autoAlpha: 1,
              y: 0,

              duration:
                0.60,

              ease:
                "power4.out"
            }
          );



          // =========================================
          // FINAL BILL CONVERGENCE
          // =========================================

          bills.forEach(
            function (bill, i) {

              tl.to(
                bill,
                {
                  y:
                    45 + i * 12,

                  x:
                    (i - 1) * 30,

                  duration:
                    0.65,

                  ease:
                    "power2.inOut"
                },

                "<"
              );

            }
          );



          // =========================================
          // FINAL CLAUDE EMPHASIS
          // =========================================

          if (claude) {

            tl.to(
              claude,
              {
                scale: 1.08,

                duration:
                  0.55,

                ease:
                  "power2.out"
              },

              "<"
            );

          }



          // =========================================
          // FINAL HOLD
          //
          // Counter remains visible + ticking.
          // =========================================

          tl.to(
            {},
            {
              duration:
                FINAL_HOLD
            }
          );



          // =========================================
          // CLEANUP
          // =========================================

          return function () {

            splits.forEach(
              function (split) {
                split.revert();
              }
            );


            floatTweens.forEach(
              function (tween) {
                tween.kill();
              }
            );

          };

        }
      );

    });

});

document.addEventListener("DOMContentLoaded", function () {

  gsap.registerPlugin(ScrollTrigger);

  gsap.utils
    .toArray("[data-map-scene]")
    .forEach(function (sec) {

      var map =
        sec.querySelector("[data-map-visual]");

      if (!map) return;


      gsap.fromTo(
        map,
        {
          autoAlpha: 0,
          y: 60,
          scale: 0.96
        },
        {
          autoAlpha: 1,
          y: 0,
          scale: 1,

          duration: 1,

          ease: "power3.out",

          scrollTrigger: {
            trigger: sec,
            start: "top 70%",
            end: "top 25%",
            scrub: 0.5
          }
        }
      );

    });

});

gsap.registerPlugin(ScrollTrigger);

window.Webflow = window.Webflow || [];

window.Webflow.push(function () {

  const section =
    document.querySelector(".section_cold-open");

  if (!section) return;


  // =========================================================
  // ELEMENTS
  // =========================================================

  const background =
    section.querySelector(
      ".container_cold-open-imagery > .image_fill"
    );

  const windows =
    gsap.utils.toArray(
      section.querySelectorAll(".image_window")
    );

  const helicopter =
    section.querySelector(".image_helicopter");

  const spotlight =
    section.querySelector(".image_spotlight");

  const maduro =
    section.querySelector(".image_maduro");

  const code =
    section.querySelector(".image_code");

  const messages =
    gsap.utils.toArray(
      section.querySelectorAll(".container_side-text")
    );


  if (!messages.length) return;



  // =========================================================
  // TEXT FIX
  // =========================================================

  messages.forEach(function (message) {

    message
      .querySelectorAll(".text-size-large")
      .forEach(function (text) {

        text.style.setProperty(
          "opacity",
          "1",
          "important"
        );

        text.style.setProperty(
          "visibility",
          "visible",
          "important"
        );

      });

  });



  // =========================================================
  // INITIAL TEXT STATE
  // =========================================================

  gsap.set(messages, {
    opacity: 0,
    visibility: "hidden"
  });


  gsap.set(messages[0], {
    opacity: 1,
    visibility: "visible"
  });



  // =========================================================
  // INITIAL VISUAL STATES
  // =========================================================

  // BACKGROUND
  if (background) {

    gsap.set(background, {
      scale: 1.08,
      clipPath: "inset(0 0% 0 0%)",
      transformOrigin: "center center"
    });

  }


  // WINDOWS
  if (windows.length) {

    gsap.set(windows, {
      autoAlpha: 0,
      scale: 0.86
    });

  }


  // HELICOPTER
  if (helicopter) {

    gsap.set(helicopter, {
      autoAlpha: 0,
      xPercent: 35,
      yPercent: -10
    });

  }


  // SPOTLIGHT
  if (spotlight) {

    gsap.set(spotlight, {
      autoAlpha: 0
    });

  }


  // MADURO
  if (maduro) {

    gsap.set(maduro, {
      autoAlpha: 0,
      yPercent: 18
    });

  }


  // CODE
  if (code) {

    gsap.set(code, {
      autoAlpha: 0,
      x: 50
    });

  }



  // =========================================================
  // VISUAL SCROLL TIMELINE
  // NO PIN / NO EXTRA HEIGHT
  // =========================================================

  const visualTl =
    gsap.timeline({

      scrollTrigger: {

        trigger: section,

        start: "top top",

        end: "bottom top",

        scrub: 0.8

      }

    });



  // =========================================================
  // 1. BACKGROUND ZOOM OUT
  // =========================================================

  if (background) {

    visualTl.to(
      background,
      {
        scale: 1,

        duration: 1.4,

        ease: "power2.out"
      },
      0
    );

  }



  // =========================================================
  // 2. WINDOWS APPEAR
  // =========================================================

  if (windows.length) {

    visualTl.to(
      windows,
      {
        autoAlpha: 1,
        scale: 1,

        duration: 0.8,

        stagger: 0.12,

        ease: "power3.out"
      },
      0.25
    );

  }



  // =========================================================
  // 3. HELICOPTER ENTERS
  // =========================================================

  if (helicopter) {

    visualTl.to(
      helicopter,
      {
        autoAlpha: 1,

        xPercent: 0,
        yPercent: 0,

        duration: 1.15,

        ease: "power3.out"
      },
      0.75
    );

  }



  // =========================================================
  // 4. SPOTLIGHT APPEARS
  // =========================================================

  if (spotlight) {

    visualTl.to(
      spotlight,
      {
        autoAlpha: 1,

        duration: 0.55,

        ease: "power2.out"
      },
      1.3
    );

  }



  // =========================================================
  // 5. MADURO RISES
  // =========================================================

  if (maduro) {

    visualTl.to(
      maduro,
      {
        autoAlpha: 1,

        yPercent: 0,

        duration: 1,

        ease: "power3.out"
      },
      1.45
    );

  }



  // =========================================================
  // 6. CODE ENTERS
  // =========================================================

  if (code) {

    visualTl.to(
      code,
      {
        autoAlpha: 1,

        x: 0,

        duration: 0.8,

        ease: "power3.out"
      },
      2.35
    );

  }



  // =========================================================
  // 7. SUBTLE HELICOPTER DRIFT
  // =========================================================

  if (helicopter) {

    visualTl.to(
      helicopter,
      {
        xPercent: -4,
        yPercent: 3,

        duration: 2,

        ease: "none"
      },
      2
    );

  }



  // =========================================================
  // MESSAGE SWITCHING
  // =========================================================

  let currentIndex = 0;


  function showMessage(index) {

    if (index === currentIndex) return;


    const oldMessage =
      messages[currentIndex];

    const newMessage =
      messages[index];


    // OLD OUT
    if (oldMessage) {

      gsap.killTweensOf(oldMessage);


      gsap.to(
        oldMessage,
        {
          opacity: 0,

          duration: 0.22,

          ease: "power2.out",

          onComplete: function () {

            gsap.set(
              oldMessage,
              {
                visibility: "hidden"
              }
            );

          }
        }
      );

    }


    // NEW IN
    if (newMessage) {

      gsap.killTweensOf(newMessage);


      gsap.set(
        newMessage,
        {
          visibility: "visible"
        }
      );


      gsap.fromTo(
        newMessage,
        {
          opacity: 0
        },
        {
          opacity: 1,

          duration: 0.32,

          ease: "power2.out"
        }
      );

    }


    currentIndex = index;

  }



  // =========================================================
  // TEXT SCROLL CONTROL
  //
  // LAST MESSAGE GETS A HUGE HOLD
  // =========================================================

  ScrollTrigger.create({

    trigger: section,

    start: "top top",

    end: "bottom top",

    onUpdate: function (self) {

      const p =
        self.progress;

      let index = 0;


      if (p >= 0.14) index = 1;

      if (p >= 0.28) index = 2;

      if (p >= 0.42) index = 3;

      if (p >= 0.56) index = 4;


      showMessage(index);

    }

  });



  // =========================================================
  // REFRESH
  // =========================================================

  requestAnimationFrame(function () {

    ScrollTrigger.refresh();

  });

});
/* other */



document.addEventListener("DOMContentLoaded", function () {

  gsap.registerPlugin(ScrollTrigger);

  if (typeof SplitText !== "undefined") {
    gsap.registerPlugin(SplitText);
  }


  gsap.utils
    .toArray("[data-news-scene]")
    .forEach(function (sec) {


      // =============================================
      // ELEMENTS
      // =============================================

      var groups =
        gsap.utils.toArray(
          sec.querySelectorAll("[data-news-group]")
        );

      var sectionTitle =
        sec.querySelector(".news_eyebrow");


      if (!groups.length) {
        console.warn("News section: no groups found.");
        return;
      }



      // =============================================
      // FORCE STICKY OFFSET
      //
      // Webflow Preview was outputting top: 0px,
      // so JS owns this value.
      // =============================================

      gsap.set(groups, {
        top: "2.5rem"
      });



      // =============================================
      // SECTION TITLE — "IN THE NEWS"
      // =============================================

      if (sectionTitle) {

        var headerSplit = null;
        var headerWords = [sectionTitle];


        if (typeof SplitText !== "undefined") {

          headerSplit =
            new SplitText(
              sectionTitle,
              {
                type: "words"
              }
            );

          headerWords =
            headerSplit.words;

        }


        gsap.fromTo(
          headerWords,

          {
            autoAlpha: 0,
            yPercent: 70
          },

          {
            autoAlpha: 1,
            yPercent: 0,

            duration: 0.5,

            stagger: {
              each: 0.07
            },

            ease: "power3.out",

            scrollTrigger: {

              trigger: sectionTitle,

              start: "top 85%",

              toggleActions:
                "play none none reverse"

            }

          }
        );

      }



      // =============================================
      // EACH STACKING NEWS GROUP
      // =============================================

      groups.forEach(function (group) {

        var title =
          group.querySelector(
            "[data-news-title]"
          );

        var cards =
          gsap.utils.toArray(
            group.querySelectorAll(
              "[data-news-card]"
            )
          );

        var images =
          gsap.utils.toArray(
            group.querySelectorAll(
              "[data-news-image]"
            )
          );


        if (
          !title ||
          !cards.length
        ) {

          console.warn(
            "News group missing title/cards:",
            group
          );

          return;
        }



        // ===========================================
        // CATEGORY TITLE SPLIT
        // ===========================================

        var titleSplit = null;
        var titleWords = [title];


        if (typeof SplitText !== "undefined") {

          titleSplit =
            new SplitText(
              title,
              {
                type: "words"
              }
            );

          titleWords =
            titleSplit.words;

        }



        // ===========================================
        // INITIAL STATES
        // ===========================================

        gsap.set(
          titleWords,
          {
            autoAlpha: 0,
            yPercent: 75
          }
        );


        gsap.set(
          cards,
          {
            autoAlpha: 0,
            y: 55
          }
        );


        gsap.set(
          images,
          {
            scale: 0.94
          }
        );



        // ===========================================
        // GROUP ENTRANCE TIMELINE
        // ===========================================

        var tl =
          gsap.timeline({
            paused: true
          });



        // -------------------------------------------
        // TITLE
        // -------------------------------------------

        tl.to(
          titleWords,
          {

            autoAlpha: 1,
            yPercent: 0,

            duration: 0.45,

            stagger: {
              each: 0.07
            },

            ease:
              "power3.out"

          }
        );



        // -------------------------------------------
        // THREE ARTICLE CARDS
        // -------------------------------------------

        tl.to(
          cards,
          {

            autoAlpha: 1,
            y: 0,

            duration: 0.55,

            stagger: {
              each: 0.12
            },

            ease:
              "power3.out"

          },

          "-=0.08"
        );



        // -------------------------------------------
        // ARTICLE IMAGES
        // -------------------------------------------

        if (images.length) {

          tl.to(
            images,
            {

              scale: 1,

              duration: 0.65,

              stagger: {
                each: 0.12
              },

              ease:
                "power3.out"

            },

            "<"
          );

        }



        // ===========================================
        // SCROLL TRIGGER
        // ===========================================

        ScrollTrigger.create({

          trigger: group,

          start: "top 72%",

          onEnter: function () {
            tl.play();
          },

          onLeaveBack: function () {
            tl.reverse();
          }

        });

      });



      // =============================================
      // REFRESH AFTER WEBFLOW LAYOUT SETTLES
      // =============================================

      requestAnimationFrame(function () {
        ScrollTrigger.refresh();
      });

    });

});
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


/*
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

*/
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
/*
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
      { pigs: 0, human: false },  //  1  religion of Silicon Valley
      { pigs: 0, human: false },  //  2  here are its tenets
      { pigs: 0, human: false },  //  3  Effective:
      { pigs: 0, human: false },  //  4  Altruism:
      { pigs: 0, human: false },  //  5  who can argue against
      { pigs: 1, human: true },  //  6  what does that look like
      { pigs: 2, human: true },  //  7  0.51 math
      { pigs: 2, human: true },  //  8  not so fast
      { pigs: 10, human: true },  //  9  five to ten pigs
      { pigs: 10, human: true },  // 10  it's logical, quote lands here
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
*/
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
/*
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
*/
/*
document.addEventListener("DOMContentLoaded", function () {

  gsap.registerPlugin(ScrollTrigger);

  gsap.utils.toArray("[data-ideology]").forEach(function (sec) {

    var iq = gsap.utils.selector(sec);

    var track =
      iq("[data-ideology-track]")[0];

    var heading =
      iq("[data-ideo-heading]")[0];

    var bodyWrap =
      iq("[data-ideo-body-wrap]")[0];

    var list =
      iq("[data-ideo-list]")[0];

    var quote =
      iq("[data-ideo-quote]")[0];

    var footnote =
      iq("[data-ideo-footnote]")[0];


    if (!track || !heading || !bodyWrap) return;


    var listItems =
      list
        ? gsap.utils.toArray(
          list.querySelectorAll("li")
        )
        : [];


    gsap.matchMedia().add(
      "(min-width: 992px)",
      function () {


        // =====================================================
        // INITIAL STATES
        // =====================================================

        // SCREEN 1
        gsap.set(heading, {
          autoAlpha: 1,
          y: 0
        });


        // SCREEN 2
        gsap.set(bodyWrap, {
          autoAlpha: 0,
          y: 30
        });


        // LIST ITEMS
        gsap.set(listItems, {
          autoAlpha: 0,
          y: 18
        });


        // SCREEN 3
        if (quote) {
          gsap.set(quote, {
            autoAlpha: 0,
            y: 80
          });
        }


        if (footnote) {
          gsap.set(footnote, {
            autoAlpha: 0
          });
        }



        // =====================================================
        // TIMELINE
        // =====================================================

        var tl = gsap.timeline({

          scrollTrigger: {

            trigger: track,

            start: "top top",

            end: "bottom bottom",

            scrub: 0.4

          }

        });



        // =====================================================
        // 1. TITLE + SUBTITLE HOLD
        // =====================================================

        tl.to({}, {
          duration: 1.2
        });



        // =====================================================
        // 2. TITLE + SUBTITLE LEAVE
        // =====================================================

        tl.to(
          heading,
          {
            autoAlpha: 0,
            y: -25,

            duration: 0.25,

            ease: "power2.in"
          }
        );



        // =====================================================
        // 3. BODY WRAPPER APPEARS
        // =====================================================

        tl.to(
          bodyWrap,
          {
            autoAlpha: 1,
            y: 0,

            duration: 0.30,

            ease: "power2.out"
          }
        );



        // =====================================================
        // 4. LIST ITEMS — ONE AT A TIME
        // =====================================================

        if (listItems.length) {

          tl.to(
            listItems,
            {
              autoAlpha: 1,
              y: 0,

              duration: 0.25,

              stagger: 0.30,

              ease: "power2.out"
            }
          );

        }



        // =====================================================
        // 5. BODY + FULL LIST HOLD
        // =====================================================

        tl.to({}, {
          duration: 1.5
        });



        // =====================================================
        // 6. BODY + LIST LEAVE TOGETHER
        // =====================================================

        tl.to(
          bodyWrap,
          {
            autoAlpha: 0,
            y: -25,

            duration: 0.25,

            ease: "power2.in"
          }
        );



        // =====================================================
        // 7. QUOTE ENTERS
        // =====================================================

        if (quote) {

          tl.to(
            quote,
            {
              autoAlpha: 1,
              y: 0,

              duration: 0.65,

              ease: "power3.out"
            }
          );

        }



        // =====================================================
        // 8. FOOTNOTE
        // =====================================================

        if (footnote) {

          tl.to(
            footnote,
            {
              autoAlpha: 1,

              duration: 0.20,

              ease: "power1.out"
            },
            "-=0.15"
          );

        }



        // =====================================================
        // 9. FINAL QUOTE HOLD
        // =====================================================

        tl.to({}, {
          duration: 2.0
        });

      }
    );

  });

});
*/
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
/*
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
*/
/*

document.addEventListener("DOMContentLoaded", function () {

  gsap.utils.toArray("[data-nuke-scene]").forEach(function (sec) {

    var nq = gsap.utils.selector(sec);

    var track = nq("[data-nuke-track]")[0];

    var land = nq('[data-nuke="land"]');
    var blast = nq('[data-nuke="blast"]');
    var bits = nq('[data-nuke="bits"]');

    var title = nq("[data-nuke-title]");

    // NOW THERE ARE 3 OF THESE
    var bodies = nq("[data-nuke-body]");

    // 3 QUOTES
    var slides = nq("[data-nuke-slide]");


    if (!track) return;


    // =========================================================
    // WHEN THINGS HAPPEN
    // =========================================================

    var BEATS = {

      land: 0.00,

      blast: 0.40,

      bits: 0.82,

      title: 1.30,

      // first BODY + QUOTE pair begins here
      slides: 2.30

    };


    // =========================================================
    // DURATIONS
    // =========================================================

    var DUR = {

      land: 0.34,

      blast: 0.36,

      bits: 0.34,

      title: 0.20,

      body: 0.20,

      slideMove: 0.20

    };


    // =========================================================
    // CONFIG
    // =========================================================

    var CFG = {

      scrub: 0.4,

      landFrom: "100vh",

      blastFrom: "100vh",

      bitsFrom: "-100vh",


      wordRise: 50,

      titleStagger: 0.03,

      bodyStagger: 0.02,


      // amount of timeline each quote/body pair owns
      slideStep: 1.80,


      slideFrom: "100vh",

      slideTo: "-100vh",


      // final body + quote hold
      endHold: 2.40

    };



    // =========================================================
    // DESKTOP
    // =========================================================

    gsap.matchMedia().add(
      "(min-width: 992px)",
      function () {


        var hasSplit =
          typeof SplitText !== "undefined";


        if (hasSplit) {
          gsap.registerPlugin(SplitText);
        }



        // =====================================================
        // SPLIT TEXT STORAGE
        // =====================================================

        var splits = [];


        function splitWords(el) {

          if (!el) return [];

          if (!hasSplit) {
            return [el];
          }


          var s =
            new SplitText(
              el,
              {
                type: "words"
              }
            );


          splits.push(s);

          return s.words;

        }



        // =====================================================
        // TITLE WORDS
        // =====================================================

        var titleWords =
          title.length
            ? splitWords(title[0])
            : [];



        // =====================================================
        // BODY WORD GROUPS
        //
        // [
        //   words of body 1,
        //   words of body 2,
        //   words of body 3
        // ]
        // =====================================================

        var bodyGroups =
          bodies.map(function (body) {

            return splitWords(body);

          });



        // =====================================================
        // STARTING STATES
        // =====================================================


        // LAND
        gsap.set(
          land,
          {
            y: CFG.landFrom,
            opacity: 1
          }
        );


        // BLAST
        gsap.set(
          blast,
          {
            y: CFG.blastFrom,
            xPercent: -50,
            opacity: 1
          }
        );


        // BITS
        gsap.set(
          bits,
          {
            y: CFG.bitsFrom,
            xPercent: -50,
            opacity: 1
          }
        );



        // TITLE
        gsap.set(
          titleWords,
          {
            opacity: 0,
            yPercent: CFG.wordRise
          }
        );



        // ALL THREE BODY BLOCKS START HIDDEN
        bodyGroups.forEach(function (words) {

          gsap.set(
            words,
            {
              opacity: 0,
              yPercent: CFG.wordRise
            }
          );

        });



        // ALL QUOTES WAIT BELOW FRAME
        gsap.set(
          slides,
          {
            y: CFG.slideFrom,
            yPercent: -50,
            opacity: 1
          }
        );



        // =====================================================
        // MAIN TIMELINE
        // =====================================================

        var tl =
          gsap.timeline({

            scrollTrigger: {

              trigger: track,

              start: "top top",

              end: "bottom bottom",

              scrub: CFG.scrub

            }

          });



        // =====================================================
        // 1. LAND
        // =====================================================

        tl.to(
          land,
          {
            y: 0,

            duration: DUR.land,

            ease: "power2.out"
          },
          BEATS.land
        );



        // =====================================================
        // 2. BLAST
        // =====================================================

        tl.to(
          blast,
          {
            y: 0,

            duration: DUR.blast,

            ease: "power2.out"
          },
          BEATS.blast
        );



        // =====================================================
        // 3. BITS
        // =====================================================

        tl.to(
          bits,
          {
            y: 0,

            duration: DUR.bits,

            ease: "power2.out"
          },
          BEATS.bits
        );



        // =====================================================
        // 4. TITLE
        // =====================================================

        tl.to(
          titleWords,
          {
            opacity: 1,

            yPercent: 0,

            duration: DUR.title,

            ease: "power2.out",

            stagger: {
              each: CFG.titleStagger
            }
          },
          BEATS.title
        );



        // =====================================================
        // 5. BODY + QUOTE PAIRS
        // =====================================================

        var lastAt =
          BEATS.slides;


        slides.forEach(function (slide, i) {

          var at =
            BEATS.slides +
            i * CFG.slideStep;


          var last =
            i === slides.length - 1;


          var bodyWords =
            bodyGroups[i] || [];


          // ===================================================
          // BODY i ENTERS
          // EXACTLY WHEN QUOTE i ENTERS
          // ===================================================

          if (bodyWords.length) {

            tl.to(
              bodyWords,
              {
                opacity: 1,

                yPercent: 0,

                duration: DUR.body,

                ease: "power2.out",

                stagger: {
                  each: CFG.bodyStagger
                }
              },
              at
            );

          }



          // ===================================================
          // QUOTE i ENTERS
          // ===================================================

          tl.to(
            slide,
            {
              y: 0,

              duration: DUR.slideMove,

              ease: "power3.out"
            },
            at
          );



          // ===================================================
          // BODY + QUOTE HOLD
          // ===================================================
          //
          // Nothing happens for most of slideStep.



          // ===================================================
          // BODY + QUOTE LEAVE TOGETHER
          // ===================================================

          if (!last) {

            var outAt =
              at +
              CFG.slideStep -
              DUR.slideMove;


            // QUOTE LEAVES UPWARD
            tl.to(
              slide,
              {
                y: CFG.slideTo,

                duration: DUR.slideMove,

                ease: "power3.in"
              },
              outAt
            );


            // BODY LEAVES AT SAME TIME
            if (bodyWords.length) {

              tl.to(
                bodyWords,
                {
                  opacity: 0,

                  yPercent:
                    -CFG.wordRise,

                  duration:
                    DUR.slideMove,

                  ease: "power2.in",

                  stagger: {
                    each: 0.01
                  }
                },
                outAt
              );

            }

          }


          lastAt = at;

        });



        // =====================================================
        // 6. FINAL BODY + QUOTE HOLD
        // =====================================================

        tl.to(
          {},
          {
            duration: CFG.endHold
          },
          lastAt +
          DUR.slideMove
        );



        // =====================================================
        // CLEANUP
        // =====================================================

        return function () {

          splits.forEach(function (s) {

            s.revert();

          });

        };

      }
    );

  });

});

*/
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

/*
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

}); */


  gsap.registerPlugin(ScrollTrigger);

  // GLOBAL MOTION SETTINGS

  const MOTION = {
    textFade: {
      duration: 0.22,
      ease: 'power2.out',
    },

    sceneFade: {
      duration: 1,
      ease: 'power2.out',
    },

    float: {
      x: [-8, 8],
      y: [-16, -28],
      rotate: [-3.2, 3.2],
      duration: [2.4, 3.6],
      ease: 'sine.inOut',
    },
  };

  // GLOBAL REUSABLE ANIMATIONS

  function fadeIn(target, motion = MOTION.textFade) {
    return gsap.to(target, {
      autoAlpha: 1,
      duration: motion.duration,
      ease: motion.ease,
      overwrite: true,
    });
  }

  function fadeOut(target, motion = MOTION.textFade) {
    return gsap.to(target, {
      autoAlpha: 0,
      duration: motion.duration,
      ease: motion.ease,
      overwrite: true,
    });
  }

  function createFloat(target, motion = MOTION.float, delay = 0) {
    const timeline = gsap.timeline({
      repeat: -1,
      yoyo: true,
      paused: true,
      defaults: {
        ease: motion.ease,
      },
    });

    timeline.to(
      target,
      {
        x: gsap.utils.random(motion.x[0], motion.x[1]),

        y: gsap.utils.random(motion.y[0], motion.y[1]),

        rotate: gsap.utils.random(motion.rotate[0], motion.rotate[1]),

        duration: gsap.utils.random(motion.duration[0], motion.duration[1]),
      },
      delay,
    );

    return timeline;
  }

  // MADURO INTRO

  const INTRO_DURATION = 10400;

  // MADURO SECTION

  function initMaduroScroll() {
    const maduroTrack = document.querySelector('[data-maduro-track="true"]');

    const maduroVisual = document.querySelector('[data-maduro-visual="true"]');

    const maduroMessages = gsap.utils.toArray('[data-maduro-message]');

    const maduroPoints = [0.0, 0.15, 0.3, 0.45, 0.6, 0.85];

    if (!maduroTrack || !maduroVisual || !maduroMessages.length) {
      return;
    }

    let maduroActive = 0;

    function getAllTargets(message) {
      return gsap.utils.toArray(message.querySelectorAll('[data-fade], [data-maduro-date]'));
    }

    function getVisibleTargets(message) {
      return getAllTargets(message).filter((element) => {
        if (element.hasAttribute('data-maduro-date')) {
          return element.dataset.maduroDate === 'true';
        }

        return true;
      });
    }

    // INITIAL STATE
    // Hide everything in every message first.

    maduroMessages.forEach(function (message) {
      gsap.set(getAllTargets(message), {
        autoAlpha: 0,
      });
    });

    gsap.set(getVisibleTargets(maduroMessages[0]), {
      autoAlpha: 1,
    });

    function showMaduroMessage(index) {
      if (index === maduroActive || !maduroMessages[index]) {
        return;
      }

      const oldMessage = maduroMessages[maduroActive];

      const newMessage = maduroMessages[index];

      // Everything from old message fades away,
      // including its date.

      fadeOut(getAllTargets(oldMessage));

      // New message fades in.
      // Date only participates when
      // data-maduro-date="true".

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
      },
    });

    ScrollTrigger.refresh();
  }

  // START MADURO AFTER INTRO

  function startMaduroScroll() {
    const maduroTrack = document.querySelector('[data-maduro-track="true"]');

    if (!maduroTrack) {
      return;
    }

    delete document.body.dataset.maduroLock;

    const maduroStart = maduroTrack.getBoundingClientRect().top + window.scrollY;

    const originalScrollBehavior = document.documentElement.style.scrollBehavior;

    document.documentElement.style.scrollBehavior = 'auto';

    window.scrollTo(0, maduroStart);

    setTimeout(function () {
      window.scrollTo(0, maduroStart);

      initMaduroScroll();

      ScrollTrigger.refresh();

      document.documentElement.style.scrollBehavior = originalScrollBehavior;
    }, 180);
  }

  // REFRESH / LOAD SOMEWHERE BELOW HERO

  function resumeMaduroFromCurrentPosition() {
    delete document.body.dataset.maduroLock;

    initMaduroScroll();

    ScrollTrigger.refresh();
    ScrollTrigger.update();
  }

  // DECIDE WHETHER INTRO SHOULD RUN

  window.addEventListener(
    'pageshow',
    function () {
      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          const loadedAwayFromTop = window.scrollY > 100;

          // User refreshed / landed
          // somewhere below the hero.
          // Do NOT lock or send them back.

          if (loadedAwayFromTop) {
            resumeMaduroFromCurrentPosition();

            return;
          }

          // Normal fresh visit at top.

          document.body.dataset.maduroLock = 'true';

          setTimeout(startMaduroScroll, INTRO_DURATION);
        });
      });
    },
    {
      once: true,
    },
  );

  function initClaudeSection() {
    gsap.registerPlugin(ScrollTrigger);

    gsap.utils.toArray('[data-claude-scene]').forEach(function (sec) {
      var track = sec.querySelector('[data-claude-track]');

      var lines = gsap.utils.toArray(sec.querySelectorAll('[data-claude-line]'));

      var bits = sec.querySelector('[data-claude-bits]');

      if (!track || !lines.length || !bits) {
        console.warn('Claude section missing:', {
          track: !!track,
          lines: lines.length,
          bits: !!bits,
        });

        return;
      }

      var DIM_OPACITY = 0.1;

      var BITS_IN = 0.9;

      var LINE_IN = 0.34;
      var LINE_HOLD = 0.55;

      var FINAL_HOLD = 0.8;

      gsap.matchMedia().add('(min-width: 992px)', function () {
        gsap.set(lines, {
          opacity: DIM_OPACITY,
          x: 10,
        });

        gsap.set(bits, {
          autoAlpha: 1,

          clipPath: 'polygon(0% 100%, 100% 82%, 100% 100%, 0% 100%)',
        });

        var claudeTimeline = gsap.timeline({
          scrollTrigger: {
            trigger: track,

            start: 'top top',

            end: 'bottom bottom',

            scrub: 0.5,
          },
        });

        // Bits angled reveal

        claudeTimeline.to(bits, {
          clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)',

          duration: BITS_IN,

          ease: 'power3.inOut',
        });

        // Claude lines revive

        lines.forEach(function (line) {
          claudeTimeline.to(line, {
            opacity: 1,
            x: 0,

            duration: LINE_IN,

            ease: 'power2.out',
          });

          claudeTimeline.to(
            {},
            {
              duration: LINE_HOLD,
            },
          );
        });

        claudeTimeline.to(
          {},
          {
            duration: FINAL_HOLD,
          },
        );
      });
    });

    ScrollTrigger.refresh();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initClaudeSection);
  } else {
    initClaudeSection();
  }

  document.addEventListener('DOMContentLoaded', function () {
    var actionScene = document.querySelector('[data-action-scene]');

    var takeAction = document.querySelector('[data-take-action]');

    if (!actionScene || !takeAction) {
      return;
    }

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          takeAction.classList.toggle('display-none', entry.isIntersecting);
        });
      },
      {
        threshold: 0,
      },
    );

    observer.observe(actionScene);
  });


document.addEventListener("DOMContentLoaded", function () {

  gsap.utils
    .toArray("[data-nuke-scene]")
    .forEach(function (sec, index) {

      var nq =
        gsap.utils.selector(sec);


      // =========================================================
      // ELEMENTS
      // =========================================================

      var track =
        nq("[data-nuke-track]")[0];

      var land =
        nq('[data-nuke="land"]');

      var blast =
        nq('[data-nuke="blast"]');

      var bits =
        nq('[data-nuke="bits"]');

      var title =
        nq("[data-nuke-title]");

      var bodies =
        nq("[data-nuke-body]");

      var slides =
        nq("[data-nuke-slide]");


      if (!track) {
        return;
      }


      // =========================================================
      // GLOBAL MOTION
      // =========================================================

      var TEXT_FADE =
        MOTION.textFade.duration;

      var TEXT_EASE =
        MOTION.textFade.ease;


      // =========================================================
      // WHEN THINGS HAPPEN
      // =========================================================

      var BEATS = {

        // BAM BAM BAM
        land: 0.00,

        blast: 0.06,

        bits: 0.15,

        title: 0.38,


        // Keep text / quote sequence
        // separate from the impact animation
        slides: 1.25

      };


      // =========================================================
      // DURATIONS
      // =========================================================

      var DUR = {

        land: 0.10,

        blast: 0.11,

        bits: 0.16,

        slideMove: 0.12

      };


      // =========================================================
      // CONFIG
      // =========================================================

      var CFG = {

        // Much less scroll lag
        scrub: 0.22,


        landFrom:
          "100vh",

        blastFrom:
          "100vh",


        // Whole-element text movement.
        // NO WORD SPLITTING.
        textRise: 20,


        // Body + quote pair spacing
        slideStep: 0.72,


        slideFrom:
          "100vh",

        slideTo:
          "-100vh",


        // Small final reading hold
        endHold: 0.55

      };


      // =========================================================
      // DESKTOP
      // =========================================================

      gsap
        .matchMedia()
        .add(
          "(min-width: 992px)",
          function () {


            // =====================================================
            // INITIAL STATES
            // =====================================================


            // -----------------------------------------------------
            // LAND
            // -----------------------------------------------------

            gsap.set(
              land,
              {
                y:
                  CFG.landFrom,

                opacity: 1
              }
            );


            // -----------------------------------------------------
            // BLAST
            // -----------------------------------------------------

            gsap.set(
              blast,
              {
                y:
                  CFG.blastFrom,

                xPercent:
                  -50,

                opacity:
                  1
              }
            );


            // -----------------------------------------------------
            // BITS
            //
            // Artwork stays in its final position.
            // Only the angled clipping mask reveals it.
            // Bottom → top.
            // -----------------------------------------------------

            gsap.set(
              bits,
              {
                y: 0,

                xPercent:
                  -50,

                opacity:
                  1,

                clipPath:
                  "polygon(0% 110%, 100% 92%, 100% 110%, 0% 110%)"
              }
            );


            // =====================================================
            // TITLE
            //
            // WHOLE ELEMENT.
            // ZERO SplitText.
            // =====================================================

            gsap.set(
              title,
              {
                opacity: 0,

                y:
                  CFG.textRise
              }
            );


            // =====================================================
            // BODY COPY
            //
            // WHOLE ELEMENTS.
            // ZERO SplitText.
            // =====================================================

            gsap.set(
              bodies,
              {
                opacity: 0,

                y:
                  CFG.textRise
              }
            );


            // =====================================================
            // QUOTE CARDS
            // =====================================================

            gsap.set(
              slides,
              {
                y:
                  CFG.slideFrom,

                yPercent:
                  -50,

                opacity:
                  1
              }
            );


            // =====================================================
            // MASTER TIMELINE
            // =====================================================

            var nukeTimeline =
              gsap.timeline({

                scrollTrigger: {

                  id:
                    "nuke-main-" +
                    index,

                  trigger:
                    track,

                  start:
                    "top top",

                  end:
                    "bottom bottom",

                  scrub:
                    CFG.scrub

                }

              });


            // =====================================================
            // 1. LAND
            //
            // VERY FAST
            // =====================================================

            nukeTimeline.to(
              land,
              {
                y: 0,

                duration:
                  DUR.land,

                ease:
                  "power3.out"
              },
              BEATS.land
            );


            // =====================================================
            // 2. EXPLOSION
            //
            // Begins almost immediately after land starts.
            // =====================================================

            nukeTimeline.to(
              blast,
              {
                y: 0,

                duration:
                  DUR.blast,

                ease:
                  "power3.out"
              },
              BEATS.blast
            );


            // =====================================================
            // 3. BITS
            //
            // Fast diagonal bottom → top reveal.
            // =====================================================

            nukeTimeline.to(
              bits,
              {
                clipPath:
                  "polygon(0% -10%, 100% -28%, 100% 110%, 0% 110%)",

                duration:
                  DUR.bits,

                ease:
                  "power2.inOut"
              },
              BEATS.bits
            );


            // =====================================================
            // 4. TITLE
            //
            // Whole-element fade.
            // =====================================================

            nukeTimeline.to(
              title,
              {
                opacity:
                  1,

                y:
                  0,

                duration:
                  TEXT_FADE,

                ease:
                  TEXT_EASE
              },
              BEATS.title
            );


            // =====================================================
            // 5. BODY + QUOTE PAIRS
            // =====================================================

            var lastAt =
              BEATS.slides;


            slides.forEach(
              function (
                slide,
                i
              ) {

                var at =
                  BEATS.slides +
                  i *
                  CFG.slideStep;


                var last =
                  i ===
                  slides.length -
                    1;


                var body =
                  bodies[i];


                // ===============================================
                // BODY IN
                //
                // EXACT same beat as quote.
                // ===============================================

                if (body) {

                  nukeTimeline.to(
                    body,
                    {
                      opacity:
                        1,

                      y:
                        0,

                      duration:
                        TEXT_FADE,

                      ease:
                        TEXT_EASE
                    },
                    at
                  );

                }


                // ===============================================
                // QUOTE IN
                //
                // EXACT same beat as body.
                // ===============================================

                nukeTimeline.to(
                  slide,
                  {
                    y:
                      0,

                    duration:
                      DUR.slideMove,

                    ease:
                      "power3.out"
                  },
                  at
                );


                // ===============================================
                // BODY + QUOTE EXIT
                // ===============================================

                if (!last) {

                  var outAt =
                    at +
                    CFG.slideStep -
                    DUR.slideMove;


                  // ---------------------------------------------
                  // QUOTE OUT
                  // ---------------------------------------------

                  nukeTimeline.to(
                    slide,
                    {
                      y:
                        CFG.slideTo,

                      duration:
                        DUR.slideMove,

                      ease:
                        "power3.in"
                    },
                    outAt
                  );


                  // ---------------------------------------------
                  // BODY OUT
                  // SAME EXACT BEAT
                  // ---------------------------------------------

                  if (body) {

                    nukeTimeline.to(
                      body,
                      {
                        opacity:
                          0,

                        y:
                          -CFG.textRise,

                        duration:
                          DUR.slideMove,

                        ease:
                          "power2.in"
                      },
                      outAt
                    );

                  }

                }


                lastAt =
                  at;

              }
            );


            // =====================================================
            // 6. FINAL HOLD
            // =====================================================

            nukeTimeline.to(
              {},
              {
                duration:
                  CFG.endHold
              },
              lastAt +
              DUR.slideMove
            );


            // =====================================================
            // REFRESH
            // =====================================================

            requestAnimationFrame(
              function () {

                ScrollTrigger.refresh();

              }
            );

          }
        );

    });

});

document.addEventListener("DOMContentLoaded", function () {
  gsap.utils.toArray("[data-math-scene]").forEach(function (sec) {
    var q = gsap.utils.selector(sec);

    var track =
      q("[data-math-track]")[0];

    var field =
      q('[data-dot-field="true"]')[0];

    var caption =
      q("[data-math-caption]")[0];

    var capHead =
      q("[data-math-head]")[0];

    var capSub =
      q("[data-math-sub]")[0];

    var burst =
      q("[data-math-burst]")[0];

    var end =
      q("[data-math-end]")[0];

    if (
      !track ||
      !field ||
      !caption ||
      !capHead ||
      !capSub ||
      !burst ||
      !end
    ) {
      console.warn(
        "Math dots: missing required element."
      );

      return;
    }

    // ---------------------------------
    // MOTION
    // ---------------------------------

    var TEXT_FADE =
      MOTION.textFade.duration;

    var TEXT_EASE =
      MOTION.textFade.ease;

    var DOT_FADED_OPACITY = 0.12;

    var CAP_TOP = "0vh";

    var FIELD_REST = 0;

    var BURST_SCALE = 420;

    // Tight pacing
    var FIELD_IN = 0.12;

    var FIELD_HOLD = 0.08;

    var DOT_SWAP = 0.12;

    var AFTER_SWAP_HOLD = 0.08;

    var END_HOLD = 0;

    // ---------------------------------
    // COPY
    // ---------------------------------

    var CAPTION_1 =
      "People who do not exist yet";

    var SUB_1 =
      "10⁵⁸ potential future lives";

    var CAPTION_2 =
      "8,000,000,000";

    var SUB_2 =
      "Everyone alive today";

    // ---------------------------------
    // DOT CONFIG
    // ---------------------------------

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
      return (
        Math.random() *
          (max - min) +
        min
      );
    }

    // ---------------------------------
    // BUILD DOT FIELD
    // ---------------------------------

    field.innerHTML = "";

    var centerCol =
      Math.floor(COLS / 2);

    var centerRow =
      Math.floor(ROWS / 2);

    for (
      var i = 0;
      i < COLS * ROWS;
      i++
    ) {
      var dot =
        document.createElement("div");

      dot.className =
        "math-dot";

      var col =
        i % COLS;

      var row =
        Math.floor(i / COLS);

      var size =
        random(
          DOT_SIZE_MIN,
          DOT_SIZE_MAX
        );

      dot.style.setProperty(
        "--dot-size",
        size.toFixed(2) + "px"
      );

      var inCenterBlock =
        Math.abs(
          col - centerCol
        ) <= 1 &&
        Math.abs(
          row - centerRow
        ) <= 1;

      var exactCenter =
        col === centerCol &&
        row === centerRow;

      var excludedCorner =
        col === centerCol - 1 &&
        row === centerRow - 1;

      var fixed =
        inCenterBlock &&
        !excludedCorner;

      if (exactCenter) {
        dot.classList.add(
          "is-center"
        );
      }

      if (fixed) {
        dot.classList.add(
          "is-fixed"
        );
      } else if (
        Math.random() <
        PULSE_CHANCE
      ) {
        dot.classList.add(
          "is-pulsing"
        );

        var change =
          random(
            PULSE_CHANGE_MIN,
            PULSE_CHANGE_MAX
          );

        var direction =
          Math.random() < 0.5
            ? -1
            : 1;

        var targetSize =
          Math.max(
            2,
            size +
              change *
              direction
          );

        dot.style.setProperty(
          "--pulse-scale",
          (
            targetSize /
            size
          ).toFixed(3)
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
          -random(
            0,
            3
          ).toFixed(2) + "s"
        );
      }

      field.appendChild(dot);
    }

    // ---------------------------------
    // DOT GROUPS
    // ---------------------------------

    var normalDots =
      gsap.utils.toArray(
        field.querySelectorAll(
          ".math-dot:not(.is-fixed)"
        )
      );

    var fixedDots =
      gsap.utils.toArray(
        field.querySelectorAll(
          ".math-dot.is-fixed"
        )
      );

    var centerDot =
      field.querySelector(
        ".math-dot.is-center"
      );

    gsap.set(normalDots, {
      opacity: 1,
      backgroundColor:
        DOT_COLOR
    });

    gsap.set(fixedDots, {
      opacity: 1,
      backgroundColor:
        DOT_COLOR
    });

    // ---------------------------------
    // BURST ALIGNMENT
    // ---------------------------------

    function alignBurst() {
      if (
        !centerDot ||
        !burst
      ) {
        return;
      }

      var dotRect =
        centerDot
          .getBoundingClientRect();

      var parent =
        burst.offsetParent;

      if (!parent) return;

      var parentRect =
        parent
          .getBoundingClientRect();

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

    requestAnimationFrame(
      alignBurst
    );

    window.addEventListener(
      "resize",
      alignBurst
    );

    if (
      document.fonts &&
      document.fonts.ready
    ) {
      document.fonts.ready.then(
        function () {
          alignBurst();

          ScrollTrigger.refresh();
        }
      );
    }

    // ---------------------------------
    // CAPTION LAYERS
    // ---------------------------------

    function makeCaptionLayers(
      container,
      oldText,
      newText
    ) {
      container.innerHTML = "";

      container.style.position =
        "relative";

      container.style.overflow =
        "hidden";

      var oldLayer =
        document.createElement(
          "span"
        );

      var newLayer =
        document.createElement(
          "span"
        );

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

    // ---------------------------------
    // DESKTOP
    // ---------------------------------

    gsap.matchMedia().add(
      "(min-width: 992px)",
      function () {
        // -----------------------------
        // INITIAL STATES
        // -----------------------------

        gsap.set(field, {
          opacity: 0,
          yPercent: 100
        });

        // First Math caption is already
        // visible when section arrives.

        gsap.set(caption, {
          opacity: 1,
          yPercent: -50
        });

        gsap.set(
          [
            headLayers.old,
            subLayers.old
          ],
          {
            opacity: 1
          }
        );

        gsap.set(
          [
            headLayers.next,
            subLayers.next
          ],
          {
            opacity: 0
          }
        );

        gsap.set(burst, {
          opacity: 0,
          scale: 1,

          xPercent: -50,
          yPercent: -50,

          marginTop: 0,
          marginLeft: 0
        });

        alignBurst();

        gsap.set(end, {
          opacity: 0
        });

        // -----------------------------
        // MASTER TIMELINE
        // -----------------------------

        var mathTimeline =
          gsap.timeline({
            scrollTrigger: {
              trigger: track,
              start: "top top",
              end: "bottom bottom",
              scrub: 0.35
            }
          });

        // -----------------------------
        // 1. DOT FIELD COMES IN FAST
        // -----------------------------

        var fieldAt = 0.08;

        mathTimeline.to(
          field,
          {
            opacity: 1,
            yPercent:
              FIELD_REST,

            duration:
              FIELD_IN,

            ease:
              "power2.out"
          },
          fieldAt
        );

        mathTimeline.to(
          caption,
          {
            top:
              CAP_TOP,

            yPercent: 0,

            duration: 0.18,

            ease:
              "power2.out"
          },
          fieldAt
        );

        // -----------------------------
        // 2. VERY SHORT FULL FIELD
        // -----------------------------

        var swapAt =
          fieldAt +
          FIELD_IN +
          FIELD_HOLD;

        // -----------------------------
        // 3. DOTS FADE + TEXT SWAPS
        //
        // ALL OF THIS HAPPENS TOGETHER
        // -----------------------------

        mathTimeline.to(
          normalDots,
          {
            opacity:
              DOT_FADED_OPACITY,

            duration:
              DOT_SWAP,

            ease:
              "none"
          },
          swapAt
        );

        mathTimeline.set(
          fixedDots,
          {
            opacity: 1
          },
          swapAt
        );

        // Old caption fades OUT
        // during dot transition

        mathTimeline.to(
          [
            headLayers.old,
            subLayers.old
          ],
          {
            opacity: 0,

            duration:
              TEXT_FADE,

            ease:
              TEXT_EASE
          },
          swapAt
        );

        // New caption fades IN
        // during SAME dot transition

        mathTimeline.to(
          [
            headLayers.next,
            subLayers.next
          ],
          {
            opacity: 1,

            duration:
              TEXT_FADE,

            ease:
              TEXT_EASE
          },
          swapAt
        );

        // -----------------------------
        // 4. SHORT 8-DOT BEAT
        // -----------------------------

        var burstAt =
          swapAt +
          Math.max(
            DOT_SWAP,
            TEXT_FADE
          ) +
          AFTER_SWAP_HOLD;

        // -----------------------------
        // 5. BURST
        // -----------------------------

        mathTimeline.call(
          alignBurst,
          null,
          burstAt - 0.01
        );

        mathTimeline.to(
          burst,
          {
            opacity: 1,
            duration: 0.04
          },
          burstAt
        );

        mathTimeline.to(
          burst,
          {
            scale:
              BURST_SCALE,

            duration: 0.24,

            ease:
              "power2.in"
          },
          burstAt + 0.02
        );

        mathTimeline.to(
          [
            field,
            caption
          ],
          {
            opacity: 0,

            duration:
              TEXT_FADE,

            ease:
              TEXT_EASE
          },
          burstAt + 0.14
        );

        // -----------------------------
        // 6. END TEXT
        // -----------------------------

        var endAt =
          burstAt + 0.1;

        mathTimeline.to(
          end,
          {
            opacity: 1,

            duration:
              TEXT_FADE,

            ease:
              TEXT_EASE
          },
          endAt
        );

        // -----------------------------
        // 7. SHORT FINAL HOLD
        // -----------------------------

        mathTimeline.to(
          {},
          {
            duration:
              END_HOLD
          }
        );
      }
    );
  });
});


  function initLiberty() {
    var scenes = gsap.utils.toArray('[data-liberty-scene]');
    if (!scenes.length) return;

    gsap.registerPlugin(ScrollTrigger);

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
      statueSwap: PRE + 1.1,
    };

    var DUR = {
      bandIn: 0.5,
      textIn: 0.35,
      bg: 0.6,
      swap: 0.5,
      bits: 2,
      specks: 0.4,
      figures: 0.75,
      hold: 2,
    };

    var CFG = {
      scrub: 0.4,
      bandColor: '#080331',
      figureStagger: 0.08,
      speckCount: 50,
      speckColor: '#d85a30',
      speckStart: 0.35,
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
          var sticky = q('[data-liberty-sticky]')[0];

          var libertyText = q('[data-liberty-slot-top], [data-liberty-slot-mid], [data-liberty-swap]');

          if (!track) return;

          gsap.set(libertyText, {
            opacity: 0,
          });

          var loops = [];

          // Specks

          if (host && motionOk) {
            var flick = gsap.timeline({
              paused: true,
            });

            for (var i = 0; i < CFG.speckCount; i++) {
              var sp = document.createElement('span');

              sp.style.cssText = 'position:absolute;' + 'display:block;' + 'background:' + CFG.speckColor + ';opacity:0;' + 'will-change:opacity';

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

            ScrollTrigger.create({
              trigger: track,

              start: 'top top-=' + Math.round(track.offsetHeight * CFG.speckStart),

              end: 'bottom bottom',

              onToggle: function (self) {
                if (self.isActive) {
                  flick.play();
                } else {
                  flick.pause();

                  gsap.set(host.children, {
                    opacity: 0,
                  });
                }
              },
            });
          }

          // Master timeline

          var libertyTimeline = gsap.timeline({
            scrollTrigger: {
              trigger: track,
              start: 'top top',
              end: 'bottom bottom',
              scrub: CFG.scrub,
            },
          });

          // Band entrance

          libertyTimeline.to(
            band,
            {
              height: '32%',
              duration: DUR.bandIn,
              ease: 'power2.out',
            },
            BEATS.bandIn,
          );

          // Text entrance

          libertyTimeline.to(
            libertyText,
            {
              opacity: 1,
              duration: DUR.textIn,
              ease: 'power2.out',
            },
            BEATS.textIn,
          );

          // Word swaps

          swaps.forEach(function (swap) {
            var out = swap.querySelector('[data-word="out"]');

            var inn = swap.querySelector('[data-word="in"]');

            gsap.set(inn, {
              yPercent: 100,
              opacity: 0,
            });

            libertyTimeline.to(
              out,
              {
                yPercent: -110,
                opacity: 0,
                duration: DUR.swap,
                ease: 'power2.inOut',
              },
              BEATS.swap,
            );

            libertyTimeline.to(
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

          // Background

          libertyTimeline.to(
            bgDark,
            {
              opacity: 1,
              duration: DUR.bg,
              ease: 'none',
            },
            BEATS.bg,
          );

          libertyTimeline.to(
            band,
            {
              backgroundColor: CFG.bandColor,
              duration: DUR.bg,
              ease: 'none',
            },
            BEATS.bg,
          );

          // Statue swap

          libertyTimeline.set(
            statueDark,
            {
              opacity: 1,
            },
            BEATS.statueSwap,
          );

          libertyTimeline.set(
            statueLight,
            {
              opacity: 0,
            },
            BEATS.statueSwap,
          );

          // Bits reveal

          gsap.set(bits, {
            opacity: 1,

            clipPath: 'polygon(-200% 0%, -100% 0%, 0% 100%, -100% 100%)',
          });

          libertyTimeline.to(
            bits,
            {
              clipPath: 'polygon(-100% 0%, 100% 0%, 200% 100%, 0% 100%)',

              duration: DUR.bits,
              ease: 'power2.inOut',
            },
            BEATS.bits,
          );

          var CLEAR = BEATS.hold + DUR.hold;

          // Exit

          figures.forEach(function (fig, i) {
            var side = fig.getAttribute('data-figure');

            libertyTimeline.to(
              fig,
              {
                x: side === 'left' ? -window.innerWidth : window.innerWidth,

                y: side === 'left' ? 120 : 175,

                opacity: 0,
                duration: DUR.figures,
                ease: 'power2.in',
              },
              CLEAR + i * CFG.figureStagger,
            );
          });

          libertyTimeline.to(
            bits,
            {
              opacity: 0,
              duration: 0.35,
              ease: 'power2.in',
            },
            CLEAR,
          );

          libertyTimeline.to(
            band,
            {
              height: '0%',
              duration: 0.4,
              ease: 'power2.inOut',
            },
            CLEAR + 0.1,
          );

          libertyTimeline.to(
            [statueDark, host],
            {
              opacity: 0,
              duration: 0.35,
              ease: 'power2.in',
            },
            CLEAR + 0.1,
          );

          libertyTimeline.to(
            [q('[data-liberty-swap]'), q('[data-liberty-slot-mid]')],
            {
              opacity: 0,
              duration: 0.35,
              ease: 'power2.in',
            },
            CLEAR + 0.1,
          );

          // Pig handoff

          var pig = document.querySelector('[data-pig]');

          if (pig) {
            ScrollTrigger.create({
              trigger: pig,
              start: 'top top',

              onEnter: function () {
                gsap.set(sticky, {
                  opacity: 0,
                });
              },

              onLeaveBack: function () {
                gsap.set(sticky, {
                  opacity: 1,
                });
              },
            });
          }

          // Specks reveal

          if (host) {
            libertyTimeline.to(
              host,
              {
                opacity: 1,
                duration: DUR.specks,
                ease: 'none',
              },
              BEATS.specks,
            );
          }

          // Figures enter

          figures.forEach(function (fig, i) {
            var side = fig.getAttribute('data-figure');

            libertyTimeline.fromTo(
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

          // Hold

          libertyTimeline.to(
            {},
            {
              duration: DUR.hold,
            },
            BEATS.hold,
          );

          // Figure float

          if (motionOk && figures.length) {
            figures.forEach(function (fig, i) {
              var floatTarget = fig.querySelector('[data-inner-figure="true"]');

              var f = createFloat(floatTarget, MOTION.float, i * 0.4);

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

          // Cleanup

          return function () {
            loops.forEach(function (t) {
              t.kill();
            });

            if (host) {
              host.innerHTML = '';
            }
          };
        },
      );
    });
  }

  initLiberty();



  document.addEventListener('DOMContentLoaded', function () {
    gsap.utils.toArray('[data-pig]').forEach(function (sec) {
      var pq = gsap.utils.selector(sec);

      var track = pq('[data-pig-track]')[0];
      var stackWrap = pq('[data-stack-wrapper]')[0];
      var scale = pq('[data-pig-scale]')[0];

      var lines = pq('[data-pig-line]');
      var mainTitle = pq('[data-pig-main-title]')[0];

      var closingLine = pq('[data-pig-line-closing]')[0];

      var closingTxt = closingLine ? closingLine.querySelector('[data-pig-txt]') : null;

      var intro = pq('[data-pig-intro="true"]')[0];

      var introTitle = intro ? intro.querySelector('[data-pig-intro-secondary-title]') : null;

      var introLines = intro
        ? gsap.utils.toArray(intro.querySelectorAll('[data-pig-line]')).filter(function (line) {
            if (introTitle && line.contains(introTitle)) {
              return false;
            }

            return true;
          })
        : [];

      // Normal Pig story ONLY.
      // Closing line has data-pig-line too,
      // so explicitly remove it here.
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

      var seed = herdBox.querySelector('[data-pig-cell]');

      if (!seed) return;

      var BEATS = [
        { pigs: 1, human: true },
        { pigs: 2, human: true },
        { pigs: 2, human: true },
        { pigs: 10, human: true },
      ];

      var HOLDS = [0.75, 0.75, 0.6, 0.75];

      var INTRO = {
        mainIn: 0,
        mainHold: 0.5,

        introTitleIn: 1,
        introLinesIn: 1.5,

        introOut: 2,
        gap: 0.15,
      };

      var TEXT_FADE = MOTION.textFade.duration;
      var TEXT_EASE = MOTION.textFade.ease;

      var FIG = 0.12;
      var DROP = 0.24;
      var CLEAR = 0.16;

      var QUOTE_HOLD = 0.9;
      var QUOTE_AFTER = 3;

      function cellSize(n) {
        if (n <= 1) {
          return {
            w: '75%',
            h: '75%',
          };
        }

        if (n === 2) {
          return {
            w: '75%',
            h: '50%',
          };
        }

        if (n <= 4) {
          return {
            w: '75%',
            h: '25%',
          };
        }

        var cols = Math.ceil(n / 4);

        return {
          w: 75 / cols + '%',
          h: '25%',
        };
      }

      var HERD_TARGET = 10;

      var existing = herdBox.querySelectorAll('[data-pig-cell]').length;

      for (var p = existing; p < HERD_TARGET; p++) {
        herdBox.appendChild(seed.cloneNode(true));
      }

      var herd = gsap.utils.toArray(herdBox.querySelectorAll('[data-pig-cell]'));

      gsap.matchMedia().add('(min-width: 992px)', function () {
        // Initial figures

        gsap.set([human, op, pigSide], {
          opacity: 0,
        });

        gsap.set(herd, {
          opacity: 0,
          display: 'none',
        });

        gsap.set(quote, {
          opacity: 0,
          xPercent: -50,
          yPercent: -50,
        });

        if (stackWrap) {
          gsap.set(stackWrap, {
            height: '100%',
            top: '0%',
            opacity: 1,
          });
        }

        if (scale) {
          gsap.set(scale, {
            yPercent: 100,
            opacity: 0,
          });
        }

        gsap.set(herdBox, {
          flexDirection: 'column',
          flexWrap: 'wrap',
          height: '100%',
          width: '100%',
        });

        var first = cellSize(1);

        gsap.set(herd, {
          width: first.w,
          height: first.h,
        });

        // Initial text states

        if (mainTitle) {
          gsap.set(mainTitle, {
            opacity: 0,
          });
        }

        if (intro) {
          gsap.set(intro, {
            opacity: 1,
          });
        }

        if (introTitle) {
          gsap.set(introTitle, {
            opacity: 0,
          });
        }

        if (introLines.length) {
          gsap.set(introLines, {
            opacity: 0,
          });
        }

        storyLines.forEach(function (line) {
          var txt = line.querySelector('[data-pig-txt]');

          if (txt) {
            gsap.set(txt, {
              opacity: 0,
            });
          }
        });

        // Closing wrapper stays untouched.
        // Only its inner text starts hidden.
        if (closingTxt) {
          gsap.set(closingTxt, {
            opacity: 0,
          });
        }

        var pigTimeline = gsap.timeline({
          scrollTrigger: {
            trigger: track,
            start: 'top top',
            end: 'bottom bottom',
            scrub: 0.4,
          },
        });

        // MAIN TITLE

        if (mainTitle) {
          pigTimeline.to(
            mainTitle,
            {
              opacity: 1,
              duration: TEXT_FADE,
              ease: TEXT_EASE,
            },
            INTRO.mainIn,
          );

          pigTimeline.to(
            mainTitle,
            {
              opacity: 0,
              duration: TEXT_FADE,
              ease: TEXT_EASE,
            },
            INTRO.mainHold,
          );
        }

        // INTRO MINI TITLE

        if (introTitle) {
          pigTimeline.to(
            introTitle,
            {
              opacity: 1,
              duration: TEXT_FADE,
              ease: TEXT_EASE,
            },
            INTRO.introTitleIn,
          );
        }

        // INTRO COPY

        if (introLines.length) {
          pigTimeline.to(
            introLines,
            {
              opacity: 1,
              duration: TEXT_FADE,
              ease: TEXT_EASE,
            },
            INTRO.introLinesIn,
          );
        }

        // INTRO OUT

        if (intro) {
          pigTimeline.to(
            intro,
            {
              opacity: 0,
              duration: TEXT_FADE,
              ease: TEXT_EASE,
            },
            INTRO.introOut,
          );
        }

        var at = INTRO.introOut + TEXT_FADE + INTRO.gap;

        // PIG STORY

        storyLines.forEach(function (line, i) {
          var span = HOLDS[i] !== undefined ? HOLDS[i] : 0.75;

          var txt = line.querySelector('[data-pig-txt]');

          var beat = BEATS[i] || BEATS[BEATS.length - 1];

          var prev =
            i > 0
              ? BEATS[i - 1]
              : {
                  pigs: 0,
                  human: false,
                };

          // Text enters

          if (txt) {
            pigTimeline.to(
              txt,
              {
                opacity: 1,
                duration: TEXT_FADE,
                ease: TEXT_EASE,
              },
              at,
            );

            // Lines 1–3 fade normally.
            // Line 4 fades with full composition.

            if (i !== QUOTE_AFTER) {
              pigTimeline.to(
                txt,
                {
                  opacity: 0,
                  duration: TEXT_FADE,
                  ease: TEXT_EASE,
                },
                at + span - TEXT_FADE,
              );
            }
          }

          // First Pig visualization

          if (beat.pigs > 0 && prev.pigs === 0) {
            if (stackWrap) {
              pigTimeline.to(
                stackWrap,
                {
                  height: '50%',
                  top: '50%',
                  duration: DROP,
                  ease: 'power2.inOut',
                },
                at,
              );
            }

            if (scale) {
              pigTimeline.to(
                scale,
                {
                  yPercent: 0,
                  opacity: 1,
                  duration: DROP,
                  ease: 'power2.out',
                },
                at + 0.04,
              );
            }
          }

          // Herd resize

          if (beat.pigs !== prev.pigs && beat.pigs > 0) {
            var cell = cellSize(beat.pigs);

            pigTimeline.set(
              herdBox,
              {
                justifyContent: beat.pigs <= 2 ? 'center' : 'flex-start',

                alignContent: beat.pigs <= 2 ? 'center' : 'flex-start',
              },
              at,
            );

            pigTimeline.to(
              herd,
              {
                width: cell.w,
                height: cell.h,
                duration: DROP,
                ease: 'power2.inOut',
              },
              at,
            );
          }

          var revealAt = beat.pigs !== prev.pigs ? at + DROP : at;

          // Human

          pigTimeline.to(
            human,
            {
              opacity: beat.human ? 1 : 0,
              duration: FIG,
              ease: 'none',
            },
            revealAt,
          );

          // Operator

          pigTimeline.to(
            op,
            {
              opacity: beat.human && beat.pigs > 0 ? 1 : 0,

              duration: FIG,
              ease: 'none',
            },
            revealAt,
          );

          // Pig side

          pigTimeline.to(
            pigSide,
            {
              opacity: beat.pigs > 0 ? 1 : 0,

              duration: FIG,
              ease: 'none',
            },
            revealAt,
          );

          // Herd

          herd.forEach(function (cellEl, idx) {
            pigTimeline.set(
              cellEl,
              {
                display: idx < beat.pigs ? 'flex' : 'none',
              },
              revealAt,
            );

            pigTimeline.to(
              cellEl,
              {
                opacity: idx < beat.pigs ? 1 : 0,

                duration: FIG,
                ease: 'none',
              },
              revealAt + idx * 0.01,
            );
          });

          // Counter

          if (pigCount) {
            pigTimeline.to(
              pigCount,
              {
                duration: FIG,

                snap: {
                  innerText: 1,
                },

                innerText: beat.pigs,
                ease: 'none',
              },
              revealAt,
            );
          }

          // PIG LINE 4 → QUOTE → CLOSING LINE

          if (i === QUOTE_AFTER && quote.length) {
            var transitionStart = at + span - TEXT_FADE;

            var quoteEnd = at + span + QUOTE_HOLD;

            var closingIn = quoteEnd - CLEAR;

            // Last normal Pig line fades with everything else

            if (txt) {
              pigTimeline.to(
                txt,
                {
                  opacity: 0,
                  duration: CLEAR,
                  ease: 'power2.in',
                },
                transitionStart,
              );
            }

            // Text stack clears

            if (stackWrap) {
              pigTimeline.to(
                stackWrap,
                {
                  opacity: 0,
                  duration: CLEAR,
                  ease: 'power2.in',
                },
                transitionStart,
              );
            }

            // Pig/human visual clears

            if (scale) {
              pigTimeline.to(
                scale,
                {
                  opacity: 0,
                  duration: CLEAR,
                  ease: 'power2.in',
                },
                transitionStart,
              );
            }

            // Quote enters immediately

pigTimeline.fromTo(
  quote,
  {
    opacity: 0,
    y: 60,
    xPercent: -50,
    yPercent: -50
  },
  {
    opacity: 1,
    y: 0,
    xPercent: -50,
    yPercent: -50,
    duration: 0.22,
    ease: "power3.out"
  },
  transitionStart + CLEAR
);

            // Quote fades OUT

            pigTimeline.to(
              quote,
              {
                opacity: 0,
                duration: CLEAR,
                ease: 'power2.in',
              },
              closingIn,
            );

            // Reposition text stage instantly while invisible.
            // No vertical movement during closing-line reveal.

            if (stackWrap) {
              pigTimeline.set(
                stackWrap,
                {
                  height: '100%',
                  top: '0%',
                },
                closingIn,
              );

              pigTimeline.to(
                stackWrap,
                {
                  opacity: 1,
                  duration: CLEAR,
                  ease: 'power2.out',
                },
                closingIn,
              );
            }
            // Closing line simply fades IN.
            // No y, no transform, no movement.
            if (closingTxt) {
              pigTimeline.to(
                closingTxt,
                {
                  opacity: 1,
                  duration: TEXT_FADE,
                  ease: TEXT_EASE,
                },
                closingIn,
              );
            }
          }
          at += span;
          if (i === QUOTE_AFTER) {
            at += QUOTE_HOLD;
          }
        });
        pigTimeline.to(
  {},
  {
    duration: 0.3
  },
  at
);
      });
    });
  });


/*
document.addEventListener("DOMContentLoaded", function () {
  gsap.utils.toArray("[data-ideology]").forEach(function (sec) {
    var iq = gsap.utils.selector(sec);

    var track =
      iq("[data-ideology-track]")[0];

    var title =
      iq("[data-ideo-title]")[0];

    var subtitle =
      iq("[data-ideo-subtitle]")[0];

    var body =
      iq("[data-ideo-body]")[0];

    var paragraph =
      iq("[data-ideo-paragraph]")[0];

    var list =
      iq("[data-ideo-list]")[0];

    var quote =
      iq("[data-ideo-quote]")[0];

    var footnote =
      iq("[data-ideo-footnote]")[0];

    if (
      !track ||
      !title ||
      !subtitle ||
      !body
    ) {
      return;
    }

    var listItems = list
      ? gsap.utils.toArray(
          list.querySelectorAll("li")
        )
      : [];

    var TEXT_FADE =
      MOTION.textFade.duration;

    var TEXT_EASE =
      MOTION.textFade.ease;

    gsap.matchMedia().add(
      "(min-width: 992px)",
      function () {
        // ---------------------------------
        // INITIAL STATES
        // ---------------------------------

        gsap.set(title, {
          opacity: 1
        });

        gsap.set(subtitle, {
          opacity: 0
        });

        gsap.set(body, {
          opacity: 1
        });

        if (paragraph) {
          gsap.set(paragraph, {
            opacity: 0
          });
        }

        if (listItems.length) {
          gsap.set(listItems, {
            opacity: 0
          });
        }

        if (quote) {
          gsap.set(quote, {
            opacity: 0
          });
        }

        if (footnote) {
          gsap.set(footnote, {
            opacity: 0
          });
        }

        // ---------------------------------
        // TIMELINE
        // ---------------------------------

        var ideologyTimeline =
          gsap.timeline({
            scrollTrigger: {
              trigger: track,
              start: "top top",
              end: "bottom bottom",
              scrub: 0.4
            }
          });

        // ---------------------------------
        // 1. SUBTITLE
        // Section has arrived.
        // Title is already visible.
        // ---------------------------------

        ideologyTimeline.to(
          subtitle,
          {
            opacity: 1,
            duration: TEXT_FADE,
            ease: TEXT_EASE
          },
          0.1
        );

        // Small readable hold

        ideologyTimeline.to(
          {},
          {
            duration: 0.35
          },
          0.1 + TEXT_FADE
        );

        // ---------------------------------
        // 2. TITLE + SUBTITLE LEAVE
        // ---------------------------------

        var headingOut = 0.7;

        ideologyTimeline.to(
          [title, subtitle],
          {
            opacity: 0,
            duration: TEXT_FADE,
            ease: TEXT_EASE
          },
          headingOut
        );

        // ---------------------------------
        // 3. PARAGRAPH TOP-LEFT
        // ---------------------------------

        var paragraphIn =
          headingOut + TEXT_FADE;

        if (paragraph) {
          ideologyTimeline.to(
            paragraph,
            {
              opacity: 1,
              duration: TEXT_FADE,
              ease: TEXT_EASE
            },
            paragraphIn
          );
        }

        // ---------------------------------
        // 4. BIG LIST BUILDS
        // ---------------------------------

        var listIn =
          paragraphIn +
          TEXT_FADE +
          0.2;

        if (listItems.length) {
          ideologyTimeline.to(
            listItems,
            {
              opacity: 1,
              duration: TEXT_FADE,
              stagger: 0.22,
              ease: TEXT_EASE
            },
            listIn
          );
        }

        // Work out when final list item finishes

        var listEnd =
          listIn +
          TEXT_FADE +
          Math.max(
            0,
            (listItems.length - 1) * 0.22
          );

        // ---------------------------------
        // 5. BODY / LIST HOLD
        // ---------------------------------

        var bodyOut =
          listEnd + 0.4;

        // ---------------------------------
        // 6. PARAGRAPH + LIST LEAVE
        // ---------------------------------

        var bodyTargets = [];

        if (paragraph) {
          bodyTargets.push(paragraph);
        }

        if (listItems.length) {
          bodyTargets =
            bodyTargets.concat(listItems);
        }

        if (bodyTargets.length) {
          ideologyTimeline.to(
            bodyTargets,
            {
              opacity: 0,
              duration: TEXT_FADE,
              ease: TEXT_EASE
            },
            bodyOut
          );
        }

        // ---------------------------------
        // 7. QUOTE
        // Back-to-back with body disappearing
        // ---------------------------------

        var quoteIn =
          bodyOut + TEXT_FADE;

        if (quote) {
          ideologyTimeline.to(
            quote,
            {
              opacity: 1,
              duration: TEXT_FADE,
              ease: TEXT_EASE
            },
            quoteIn
          );
        }

        // ---------------------------------
        // 8. FOOTNOTE
        // ---------------------------------

        if (footnote) {
          ideologyTimeline.to(
            footnote,
            {
              opacity: 1,
              duration: TEXT_FADE,
              ease: TEXT_EASE
            },
            quoteIn +
              TEXT_FADE +
              0.08
          );
        }

        // ---------------------------------
        // 9. FINAL HOLD
        // ---------------------------------

        var finalHoldStart =
          quoteIn +
          TEXT_FADE +
          0.15;

        ideologyTimeline.to(
          {},
          {
            duration: 0.45
          },
          finalHoldStart
        );
      }
    );
  });
});
*/

document.addEventListener("DOMContentLoaded", function () {

  gsap.utils
    .toArray("[data-ideology]")
    .forEach(function (sec) {

      var iq =
        gsap.utils.selector(sec);


      var track =
        iq("[data-ideology-track]")[0];

      var title =
        iq("[data-ideo-title]")[0];

      var subtitle =
        iq("[data-ideo-subtitle]")[0];

      var body =
        iq("[data-ideo-body]")[0];

      var paragraph =
        iq("[data-ideo-paragraph]")[0];

      var list =
        iq("[data-ideo-list]")[0];

      var quote =
        iq("[data-ideo-quote]")[0];


      if (
        !track ||
        !title ||
        !subtitle ||
        !body
      ) {
        return;
      }


      var listItems =
        list
          ? gsap.utils.toArray(
              list.querySelectorAll("li")
            )
          : [];


      var TEXT_FADE =
        MOTION.textFade.duration;

      var TEXT_EASE =
        MOTION.textFade.ease;


      gsap.matchMedia().add(
        "(min-width: 992px)",
        function () {


          // Initial states

          gsap.set(
            title,
            {
              opacity: 1
            }
          );


          gsap.set(
            subtitle,
            {
              opacity: 0
            }
          );


          gsap.set(
            body,
            {
              opacity: 1
            }
          );


          if (paragraph) {

            gsap.set(
              paragraph,
              {
                opacity: 0
              }
            );
          }


          if (listItems.length) {

            gsap.set(
              listItems,
              {
                opacity: 0
              }
            );
          }


          if (quote) {

            gsap.set(
              quote,
              {
                opacity: 0
              }
            );
          }


          var ideologyTimeline =
            gsap.timeline({

              scrollTrigger: {

                trigger:
                  track,

                start:
                  "top top",

                end:
                  "bottom bottom",

                scrub:
                  0.4
              }
            });


          // Subtitle in

          ideologyTimeline.to(
            subtitle,
            {
              opacity:
                1,

              duration:
                TEXT_FADE,

              ease:
                TEXT_EASE
            },
            0.1
          );


          ideologyTimeline.to(
            {},
            {
              duration:
                0.35
            },
            0.1 + TEXT_FADE
          );


          // Heading out

          var headingOut =
            0.7;


          ideologyTimeline.to(
            [
              title,
              subtitle
            ],
            {
              opacity:
                0,

              duration:
                TEXT_FADE,

              ease:
                TEXT_EASE
            },
            headingOut
          );


          // Paragraph in

          var paragraphIn =
            headingOut +
            TEXT_FADE;


          if (paragraph) {

            ideologyTimeline.to(
              paragraph,
              {
                opacity:
                  1,

                duration:
                  TEXT_FADE,

                ease:
                  TEXT_EASE
              },
              paragraphIn
            );
          }


          // List builds

          var listIn =
            paragraphIn +
            TEXT_FADE +
            0.2;


          if (listItems.length) {

            ideologyTimeline.to(
              listItems,
              {
                opacity:
                  1,

                duration:
                  TEXT_FADE,

                stagger:
                  0.22,

                ease:
                  TEXT_EASE
              },
              listIn
            );
          }


          var listEnd =
            listIn +
            TEXT_FADE +
            Math.max(
              0,
              (listItems.length - 1) *
              0.22
            );


          // Body hold

          var bodyOut =
            listEnd +
            0.4;


          // Paragraph + list out

          var bodyTargets =
            [];


          if (paragraph) {

            bodyTargets.push(
              paragraph
            );
          }


          if (listItems.length) {

            bodyTargets =
              bodyTargets.concat(
                listItems
              );
          }


          if (bodyTargets.length) {

            ideologyTimeline.to(
              bodyTargets,
              {
                opacity:
                  0,

                duration:
                  TEXT_FADE,

                ease:
                  TEXT_EASE
              },
              bodyOut
            );
          }


          // Quote wrapper in
          // Footnote is inside this wrapper,
          // so both appear together.

          var quoteIn =
            bodyOut +
            TEXT_FADE;


          if (quote) {

            ideologyTimeline.to(
              quote,
              {
                opacity:
                  1,

                duration:
                  TEXT_FADE,

                ease:
                  TEXT_EASE
              },
              quoteIn
            );
          }


          // Final hold

          var finalHoldStart =
            quoteIn +
            TEXT_FADE;


          ideologyTimeline.to(
            {},
            {
              duration:
                0.45
            },
            finalHoldStart
          );

        }
      );

    });

});


/*
document.addEventListener("DOMContentLoaded", function () {

  gsap.registerPlugin(ScrollTrigger);

  gsap.utils.toArray("[data-math-scene]").forEach(function (sec) {

    var q = gsap.utils.selector(sec);

    var track = q("[data-math-track]")[0];

    var field = q('[data-dot-field="true"]')[0];

    var caption = q("[data-math-caption]")[0];
    var capHead = q("[data-math-head]")[0];
    var capSub = q("[data-math-sub]")[0];

    var burst = q("[data-math-burst]")[0];
    var end = q("[data-math-end]")[0];


    if (
      !track ||
      !field ||
      !caption ||
      !capHead ||
      !capSub ||
      !burst ||
      !end
    ) {
      console.warn("Math dots: missing required element.");
      return;
    }



    // =========================================================
    // CONFIG
    // =========================================================

    var XFADE = 0.55;

    var DOT_FADED_OPACITY = 0.12;

    var CAP_TOP = "0vh";

    var FIELD_REST = 0;

    var BURST_SCALE = 420;

    var END_HOLD = 1.75;


    // Timing for ONLY the remaining dot story
    var CAPTION_IN = 0.30;

    var FIELD_IN = 0.38;

    // This is the important hold.
    // Gives the full field time to breathe.
    var FIELD_HOLD = 2.40;

    var AFTER_SWAP_HOLD = 0.85;



    // =========================================================
    // CAPTION COPY
    // =========================================================

    var CAPTION_1 =
      "People who do not exist yet";

    var SUB_1 =
      "10⁵⁸ potential future lives";


    var CAPTION_2 =
      "8,000,000,000";

    var SUB_2 =
      "Everyone alive today";



    // =========================================================
    // DOT CONFIG
    // =========================================================

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

      return (
        Math.random() *
        (max - min) +
        min
      );

    }



    // =========================================================
    // BUILD DOT FIELD
    // =========================================================

    field.innerHTML = "";


    var centerCol =
      Math.floor(COLS / 2);

    var centerRow =
      Math.floor(ROWS / 2);



    for (
      var i = 0;
      i < COLS * ROWS;
      i++
    ) {

      var dot =
        document.createElement("div");


      dot.className =
        "math-dot";


      var col =
        i % COLS;


      var row =
        Math.floor(i / COLS);


      var size =
        random(
          DOT_SIZE_MIN,
          DOT_SIZE_MAX
        );


      dot.style.setProperty(
        "--dot-size",
        size.toFixed(2) + "px"
      );



      var inCenterBlock =
        Math.abs(
          col - centerCol
        ) <= 1 &&
        Math.abs(
          row - centerRow
        ) <= 1;



      var exactCenter =
        col === centerCol &&
        row === centerRow;



      // Remove top-left corner from 3×3,
      // leaving exactly 8 highlighted dots.
      var excludedCorner =
        col === centerCol - 1 &&
        row === centerRow - 1;



      var fixed =
        inCenterBlock &&
        !excludedCorner;



      if (exactCenter) {

        dot.classList.add(
          "is-center"
        );

      }



      if (fixed) {

        dot.classList.add(
          "is-fixed"
        );

      }

      else if (
        Math.random() <
        PULSE_CHANCE
      ) {

        dot.classList.add(
          "is-pulsing"
        );


        var change =
          random(
            PULSE_CHANGE_MIN,
            PULSE_CHANGE_MAX
          );


        var direction =
          Math.random() < 0.5
            ? -1
            : 1;


        var targetSize =
          Math.max(
            2,
            size +
            change *
            direction
          );


        dot.style.setProperty(
          "--pulse-scale",
          (
            targetSize /
            size
          ).toFixed(3)
        );


        dot.style.setProperty(
          "--pulse-duration",
          random(
            PULSE_DURATION_MIN,
            PULSE_DURATION_MAX
          ).toFixed(2) +
          "s"
        );


        dot.style.setProperty(
          "--pulse-delay",
          -random(
            0,
            3
          ).toFixed(2) +
          "s"
        );

      }


      field.appendChild(dot);

    }



    // =========================================================
    // DOT GROUPS
    // =========================================================

    var normalDots =
      gsap.utils.toArray(
        field.querySelectorAll(
          ".math-dot:not(.is-fixed)"
        )
      );


    var fixedDots =
      gsap.utils.toArray(
        field.querySelectorAll(
          ".math-dot.is-fixed"
        )
      );


    var centerDot =
      field.querySelector(
        ".math-dot.is-center"
      );



    gsap.set(
      normalDots,
      {
        opacity: 1,
        backgroundColor:
          DOT_COLOR
      }
    );


    gsap.set(
      fixedDots,
      {
        opacity: 1,
        backgroundColor:
          DOT_COLOR
      }
    );



    // =========================================================
    // ALIGN BURST TO CENTER DOT
    // =========================================================

    function alignBurst() {

      if (
        !centerDot ||
        !burst
      ) {
        return;
      }


      var dotRect =
        centerDot
          .getBoundingClientRect();


      var parent =
        burst.offsetParent;


      if (!parent) return;


      var parentRect =
        parent
          .getBoundingClientRect();



      gsap.set(
        burst,
        {

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

        }
      );

    }



    requestAnimationFrame(
      alignBurst
    );


    window.addEventListener(
      "resize",
      alignBurst
    );


    if (
      document.fonts &&
      document.fonts.ready
    ) {

      document.fonts.ready.then(
        function () {

          alignBurst();

          ScrollTrigger.refresh();

        }
      );

    }



    // =========================================================
    // BUILD CAPTION LAYERS
    // =========================================================

    function makeCaptionLayers(
      container,
      oldText,
      newText
    ) {

      container.innerHTML = "";


      container.style.position =
        "relative";

      container.style.overflow =
        "hidden";


      var oldLayer =
        document.createElement(
          "span"
        );


      var newLayer =
        document.createElement(
          "span"
        );


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



    // =========================================================
    // DESKTOP
    // =========================================================

    gsap.matchMedia().add(
      "(min-width: 992px)",
      function () {


        var hasSplit =
          typeof SplitText !==
          "undefined";


        if (hasSplit) {

          gsap.registerPlugin(
            SplitText
          );

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



        // =====================================================
        // ONLY THE TEXT THAT STILL EXISTS
        // =====================================================

        var oldHeadWords =
          splitWords(
            headLayers.old
          );


        var oldSubWords =
          splitWords(
            subLayers.old
          );


        var newHeadWords =
          splitWords(
            headLayers.next
          );


        var newSubWords =
          splitWords(
            subLayers.next
          );


        var endWords =
          splitWords(end);



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



        // =====================================================
        // INITIAL STATES
        // =====================================================

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

            xPercent: -50,

            yPercent: -50,

            marginTop: 0,

            marginLeft: 0
          }
        );


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



        // =====================================================
        // TIMELINE
        //
        // STARTS AT ZERO WITH THE DOT STORY.
        // NO DEAD MATH STACK.
        // =====================================================

        var tl =
          gsap.timeline({

            scrollTrigger: {

              trigger: track,

              start:
                "top top",

              end:
                "bottom bottom",

              scrub:
                0.4

            }

          });



        // =====================================================
        // 1. FIRST CAPTION
        // =====================================================

        var capAt = 0;


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

            duration:
              CAPTION_IN,

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



        // =====================================================
        // 2. DOT FIELD RISES
        // =====================================================

        var fieldAt =
          capAt + 0.65;


        tl.to(
          field,
          {
            opacity: 1,

            yPercent:
              FIELD_REST,

            duration:
              FIELD_IN,

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



        // =====================================================
        // 3. FULL DOT FIELD HOLDS
        // =====================================================

        var litAt =
          fieldAt +
          FIELD_HOLD;



        // =====================================================
        // 4. ALL BUT 8 DOTS FADE
        // =====================================================

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



        // =====================================================
        // 5. CAPTION SWAPS
        // =====================================================

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



        // =====================================================
        // 6. HOLD THE 8-DOT COMPARISON
        // =====================================================

        var burstAt =
          swapAt +
          AFTER_SWAP_HOLD;



        // =====================================================
        // 7. BURST
        // =====================================================

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
          [
            field,
            caption
          ],
          {
            opacity: 0,

            duration: 0.14
          },
          burstAt + 0.24
        );



        // =====================================================
        // 8. END TEXT
        // =====================================================

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


        // =====================================================
        // 9. FINAL HOLD
        // =====================================================

        tl.to(
          {},
          {
            duration:
              END_HOLD
          }
        );



        // =====================================================
        // CLEANUP
        // =====================================================

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

*/
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
/*
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
*/

document.addEventListener("DOMContentLoaded", function () {

  gsap.registerPlugin(ScrollTrigger);

  gsap.utils
    .toArray("[data-opt-scene]")
    .forEach(function (sec, index) {

      var q =
        gsap.utils.selector(sec);

      var track =
        q("[data-opt-track]")[0];

      var intro =
        q("[data-opt-intro]")[0];

      var introText =
        q("[data-opt-intro-txt]")[0] ||
        intro;

      var blocks =
        q("[data-opt-block]");


      if (
        !track ||
        !intro ||
        !blocks.length
      ) {
        return;
      }


      // =========================================================
      // DUPLICATE GUARD
      // =========================================================

      if (
        sec.dataset.optInitialized ===
        "true"
      ) {
        console.warn(
          "OPT already initialized — skipping duplicate.",
          sec
        );

        return;
      }

      sec.dataset.optInitialized =
        "true";


      // =========================================================
      // GLOBAL MOTION
      // =========================================================

      var TEXT_FADE =
        MOTION.textFade.duration;

      var TEXT_EASE =
        MOTION.textFade.ease;


      // =========================================================
      // CONFIG
      // =========================================================

      var INTRO_HOLD =
        0.80;

      var CARD_IN =
        0.85;

      var CARD_HOLD =
        0.55;

      var QUOTE_IN =
        0.65;

      var QUOTE_HOLD =
        0.95;


      // Intro whole-element rise

      var TEXT_RISE =
        24;


      // Quote starts this far below
      // its Designer position.

      var QUOTE_START =
        "65vh";


      // How far title + body move upward
      // when quote enters.

      var TEXT_PUSH =
        "-19vh";


      // =========================================================
      // TRAPEZOID TOPS
      // =========================================================

      var CARD_CLIPS = [

        "polygon(0 8%, 100% 3%, 100% 100%, 0 100%)",

        "polygon(0 4%, 100% 9%, 100% 100%, 0 100%)",

        "polygon(0 10%, 100% 5%, 100% 100%, 0 100%)",

        "polygon(0 6%, 100% 2%, 100% 100%, 0 100%)"

      ];


      // =========================================================
      // DESKTOP
      // =========================================================

      gsap
        .matchMedia()
        .add(
          "(min-width: 992px)",
          function () {


            // =====================================================
            // INTRO
            //
            // WHOLE ELEMENT.
            // NO SPLITTEXT.
            // =====================================================

            gsap.set(
              intro,
              {
                zIndex: 1
              }
            );


            gsap.set(
              introText,
              {
                autoAlpha: 0,
                y: TEXT_RISE
              }
            );


            // =====================================================
            // BLOCK INITIAL STATES
            // =====================================================

            blocks.forEach(
              function (block, i) {

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


                // Every new card sits above
                // the previous card.

                gsap.set(
                  block,
                  {
                    zIndex:
                      i + 2,

                    yPercent:
                      100,

                    rotation:
                      0,

                    scale:
                      1,

                    clipPath:
                      CARD_CLIPS[
                        i %
                        CARD_CLIPS.length
                      ]
                  }
                );


                // Head + body remain exactly
                // where designed initially.

                if (head) {

                  gsap.set(
                    head,
                    {
                      y: 0
                    }
                  );

                }


                if (copy) {

                  gsap.set(
                    copy,
                    {
                      y: 0
                    }
                  );

                }


                // Quote waits below its
                // Designer position.

                if (quote) {

                  gsap.set(
                    quote,
                    {
                      y:
                        QUOTE_START,

                      autoAlpha:
                        0
                    }
                  );

                }

              }
            );


            // =====================================================
            // MASTER TIMELINE
            // =====================================================

            var optTimeline =
              gsap.timeline({

                scrollTrigger: {

                  id:
                    "opt-" +
                    index,

                  trigger:
                    track,

                  start:
                    "top top",

                  end:
                    "bottom bottom",

                  scrub:
                    0.4,

                  invalidateOnRefresh:
                    true

                }

              });


            // =====================================================
            // 1. INTRO
            //
            // Whole-element fade.
            // =====================================================

            optTimeline.to(
              introText,
              {
                autoAlpha:
                  1,

                y:
                  0,

                duration:
                  TEXT_FADE,

                ease:
                  TEXT_EASE
              },
              0
            );


            // Reading hold

            optTimeline.to(
              {},
              {
                duration:
                  INTRO_HOLD
              }
            );


            // =====================================================
            // 2. STACKED CARDS
            // =====================================================

            blocks.forEach(
              function (block) {

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


                // =================================================
                // CARD ENTERS
                //
                // Same physical card movement as before.
                // =================================================

                optTimeline.to(
                  block,
                  {
                    yPercent:
                      0,

                    duration:
                      CARD_IN,

                    ease:
                      "none"
                  }
                );


                // Let head/body breathe.

                optTimeline.to(
                  {},
                  {
                    duration:
                      CARD_HOLD
                  }
                );


                // =================================================
                // QUOTE ENTERS
                // =================================================

                if (quote) {

                  optTimeline.to(
                    quote,
                    {
                      y:
                        0,

                      autoAlpha:
                        1,

                      duration:
                        QUOTE_IN,

                      ease:
                        "power3.out"
                    }
                  );


                  // ===============================================
                  // HEAD + BODY PUSH UP
                  // ===============================================

                  var textTargets =
                    [];


                  if (head) {
                    textTargets.push(
                      head
                    );
                  }


                  if (copy) {
                    textTargets.push(
                      copy
                    );
                  }


                  if (
                    textTargets.length
                  ) {

                    optTimeline.to(
                      textTargets,
                      {
                        y:
                          TEXT_PUSH,

                        duration:
                          QUOTE_IN,

                        ease:
                          "power3.inOut"
                      },
                      "<"
                    );

                  }

                }


                // =================================================
                // FULL COMPOSITION HOLD
                // =================================================

                optTimeline.to(
                  {},
                  {
                    duration:
                      QUOTE_HOLD
                  }
                );


                // No outgoing animation.
                //
                // The next card simply slides
                // over the current one.

              }
            );


            // =====================================================
            // FINAL HOLD
            // =====================================================

            optTimeline.to(
              {},
              {
                duration:
                  1.2
              }
            );


            // =====================================================
            // REFRESH
            // =====================================================

            requestAnimationFrame(
              function () {

                ScrollTrigger.refresh();

              }
            );

          }
        );

    });

});
/*
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

        tl.to(
  face,
  {
    opacity: 0.3,
    duration: zoomDuration,
    ease: "none"
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
*/
/*

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
        quotes.length < 3
      ) {
        console.warn("Askell section: missing required element.");
        return;
      }



      // =====================================================
      // CONFIG
      // =====================================================

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


          // ===================================================
          // SPLIT TEXT
          // ===================================================

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



          // ===================================================
          // QUOTE TEXT
          // ===================================================

          var quote1Text =
            quotes[0].querySelector(
              "[data-askell-quote-text]"
            ) || quotes[0];


          var quote2Text =
            quotes[1].querySelector(
              "[data-askell-quote-text]"
            ) || quotes[1];


          var quote3Text =
            quotes[2].querySelector(
              "[data-askell-quote-text]"
            ) || quotes[2];



          var quote1Words =
            splitWords(quote1Text);

          var quote2Words =
            splitWords(quote2Text);

          var quote3Words =
            splitWords(quote3Text);



          // ===================================================
          // INITIAL STATES
          // ===================================================

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


          // Amanda starts below viewport
          gsap.set(
            person,
            {
              y: "110vh"
            }
          );


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


          gsap.set(
            floats,
            {
              autoAlpha: 0,
              y: 0
            }
          );


          // All 3 quote wrappers hidden
          gsap.set(
            quotes,
            {
              autoAlpha: 0
            }
          );


          // All quote words hidden
          gsap.set(
            quote1Words
              .concat(quote2Words)
              .concat(quote3Words),
            {
              autoAlpha: 0,
              yPercent: 70
            }
          );



          // ===================================================
          // AMANDA CONTINUOUS FLOAT
          // ===================================================

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



          // ===================================================
          // FLOATING LABEL PATHS
          // ===================================================

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

                  rotation: rotation,

                  duration:
                    2.3 + i * 0.22,

                  ease: "sine.inOut",

                  repeat: -1,
                  yoyo: true
                }
              );


            floatTweens.push(tween);

          });



          // ===================================================
          // MASTER TIMELINE
          // ===================================================

          var tl =
            gsap.timeline({

              scrollTrigger: {

                trigger: track,

                start: "top top",

                end: "bottom bottom",

                scrub: 0.5

              }

            });



          // ===================================================
          // 0. BACKGROUND ONLY
          // ===================================================

          tl.to(
            {},
            {
              duration: EMPTY_HOLD
            }
          );



          // ===================================================
          // 1. TITLE
          // ===================================================

          tl.to(
            titleWords,
            {
              autoAlpha: 1,

              yPercent: 0,

              duration: WORD_IN,

              ease: "power3.out",

              stagger: {
                each: WORD_STAGGER_IN
              }
            }
          );


          tl.to(
            {},
            {
              duration: TITLE_HOLD
            }
          );



          // ===================================================
          // 2. BODY
          // ===================================================

          tl.to(
            bodyWords,
            {
              autoAlpha: 1,

              yPercent: 0,

              duration: WORD_IN,

              ease: "power3.out",

              stagger: {
                each: WORD_STAGGER_IN
              }
            }
          );


          tl.to(
            {},
            {
              duration: BODY_HOLD
            }
          );



          // ===================================================
          // 3. AMANDA RISES
          // ===================================================

          tl.to(
            person,
            {
              y: 0,

              duration: PERSON_IN,

              ease: "power3.out"
            }
          );


          tl.to(
            introGroup,
            {
              y: "-115vh",

              duration: PERSON_IN,

              ease: "power3.inOut"
            },
            "<"
          );



          // ===================================================
          // 4. FLOATS ENTER
          // ===================================================

          tl.to(
            floats,
            {
              autoAlpha: 1,

              duration: FLOAT_IN,

              ease: "power2.out",

              stagger: {
                each: 0.075
              }
            },
            "<+0.35"
          );


          tl.to(
            {},
            {
              duration: FLOAT_HOLD
            }
          );



          // ===================================================
          // 5. FLOATS LEAVE
          // ===================================================

          tl.to(
            floats,
            {
              autoAlpha: 0,

              y: "-55vh",

              duration: FLOAT_OUT,

              ease: "power2.in",

              stagger: {
                each: 0.045
              }
            }
          );



          // ===================================================
          // 6. QUOTE 1
          // ===================================================

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

              duration: WORD_IN,

              ease: "power3.out",

              stagger: {
                each: WORD_STAGGER_IN
              }
            }
          );


          tl.to(
            {},
            {
              duration: QUOTE_HOLD
            }
          );



          // QUOTE 1 LEAVES

          tl.to(
            quote1Words,
            {
              autoAlpha: 0,

              yPercent: -70,

              duration: WORD_OUT,

              ease: "power2.in",

              stagger: {
                each: WORD_STAGGER_OUT
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
              duration: QUOTE_GAP
            }
          );



          // ===================================================
          // 7. QUOTE 2
          // ===================================================

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

              duration: WORD_IN,

              ease: "power3.out",

              stagger: {
                each: WORD_STAGGER_IN
              }
            }
          );


          tl.to(
            {},
            {
              duration: QUOTE_HOLD
            }
          );



          // QUOTE 2 LEAVES

          tl.to(
            quote2Words,
            {
              autoAlpha: 0,

              yPercent: -70,

              duration: WORD_OUT,

              ease: "power2.in",

              stagger: {
                each: WORD_STAGGER_OUT
              }
            }
          );


          tl.set(
            quotes[1],
            {
              autoAlpha: 0
            }
          );


          tl.to(
            {},
            {
              duration: QUOTE_GAP
            }
          );



          // ===================================================
          // 8. QUOTE 3
          // ===================================================

          tl.set(
            quotes[2],
            {
              autoAlpha: 1
            }
          );


          tl.to(
            quote3Words,
            {
              autoAlpha: 1,

              yPercent: 0,

              duration: WORD_IN,

              ease: "power3.out",

              stagger: {
                each: WORD_STAGGER_IN
              }
            }
          );



          // ===================================================
          // FINAL HOLD — QUOTE 3 STAYS
          // ===================================================

          tl.to(
            {},
            {
              duration: FINAL_HOLD
            }
          );



          // ===================================================
          // CLEANUP
          // ===================================================

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
*/


function initFTX() {
  gsap.registerPlugin(ScrollTrigger);

  gsap.utils.toArray(".section_ftx").forEach(function (sec, index) {

    // =========================================================
    // CORE
    // =========================================================

    var track = sec.querySelector(".ftx_track");
    var camera = sec.querySelector(".ftx_camera");
    var background = sec.querySelector(".ftx_background");
    var face = sec.querySelector(".ftx_face");
    var money = sec.querySelector(".ftx_money");

    var blocks = gsap.utils
      .toArray(sec.querySelectorAll(".ftx_block"))
      .slice(0, 5);

    if (!track || !camera || !background || blocks.length < 5) {
      console.warn("FTX missing required elements.", {
        track: !!track,
        camera: !!camera,
        background: !!background,
        face: !!face,
        money: !!money,
        blocks: blocks.length
      });
      return;
    }

    if (sec.dataset.ftxInitialized === "true") return;
    sec.dataset.ftxInitialized = "true";


    // =========================================================
    // SETTINGS
    // =========================================================

    var TEXT_FADE =
      typeof MOTION !== "undefined" && MOTION.textFade
        ? MOTION.textFade.duration
        : 0.22;

    var TEXT_EASE =
      typeof MOTION !== "undefined" && MOTION.textFade
        ? MOTION.textFade.ease
        : "power2.out";

    var INTRO_HOLD = 0.45;
    var BLOCK_HOLD = 0.45;

    var FACE_FADE = 0.35;

    var MONEY_START = "100vh";
    var MONEY_IN = 0.50;

    // Both tables
    var ROW_FADE = 0.22;
    var ROW_GAP = 0.07;

    // Rewrite
    var TYPE_BEFORE = 0.85;
    var TYPE_STRIKE = 0.52;
    var BEFORE_STRIKE_PAUSE = 0.12;

    var STRIKE_DURATION = 0.28;
    var STRIKE_DIM = 0.50;
    var STRIKE_DIM_DURATION = 0.22;

    var AFTER_STRIKE_PAUSE = 0.10;
    var TYPE_AFTER = 0.42;
    var REWRITE_HOLD = 0.65;

    // Counters
    var COUNTER_DURATION = 0.55;

    var FINAL_HOLD = 0.90;

    // Camera
    var FOCUS_SOURCE_X = 67.93;
    var FOCUS_SOURCE_Y = 22.74;
    var FINAL_ZOOM = 3.8;


    // =========================================================
    // DESKTOP
    // =========================================================

    gsap.matchMedia().add("(min-width: 992px)", function () {

      // =====================================================
      // CAMERA
      // =====================================================

      function getCameraFocus() {
        var cw = camera.clientWidth;
        var ch = camera.clientHeight;
        var iw = background.naturalWidth || 0;
        var ih = background.naturalHeight || 0;

        if (!cw || !ch || !iw || !ih) {
          return {
            x: FOCUS_SOURCE_X,
            y: FOCUS_SOURCE_Y
          };
        }

        var coverScale = Math.max(cw / iw, ch / ih);

        var renderedWidth = iw * coverScale;
        var renderedHeight = ih * coverScale;

        var offsetX = (cw - renderedWidth) / 2;
        var offsetY = (ch - renderedHeight) / 2;

        var focusX =
          offsetX +
          renderedWidth * (FOCUS_SOURCE_X / 100);

        var focusY =
          offsetY +
          renderedHeight * (FOCUS_SOURCE_Y / 100);

        return {
          x: focusX / cw * 100,
          y: focusY / ch * 100
        };
      }


      function applyCameraFocus() {
        var focus = getCameraFocus();

        gsap.set(camera, {
          transformOrigin:
            focus.x + "% " +
            focus.y + "%"
        });
      }


      // =====================================================
      // BLOCK 3 — CONVICTIONS TABLE
      // =====================================================

      var convictionRows =
        gsap.utils.toArray(
          blocks[2].querySelectorAll(
            "[data-ftx-row], .ftx-row"
          )
        );


      // =====================================================
      // BLOCK 4 — REWRITE
      // =====================================================

      var rewrite =
        blocks[3].querySelector(
          "[data-ftx-rewrite], .ftx_rewrite"
        );

      var beforeEl =
        rewrite
          ? rewrite.querySelector(
              "[data-ftx-type-before], .ftx_rewrite-before"
            )
          : null;

      var strikeEl =
        rewrite
          ? rewrite.querySelector(
              "[data-ftx-type-strike], .ftx_rewrite-strike"
            )
          : null;

      var afterEl =
        rewrite
          ? rewrite.querySelector(
              "[data-ftx-type-after], .ftx_rewrite-after"
            )
          : null;


      // =====================================================
      // TYPEWRITER BUILDER
      // =====================================================

      function buildCharacters(el) {
        if (!el) return null;

        var original = el.textContent;
        var chars = [];
        var words = [];
        var fragment = document.createDocumentFragment();

        el.textContent = "";

        original.split(/(\s+)/).forEach(function (token) {
          if (!token) return;

          if (/^\s+$/.test(token)) {
            fragment.appendChild(
              document.createTextNode(token)
            );
            return;
          }

          var word = document.createElement("span");
          word.style.whiteSpace = "nowrap";

          Array.from(token).forEach(function (letter) {
            var char = document.createElement("span");

            char.textContent = letter;
            char.style.visibility = "hidden";
            char.style.opacity = "1";

            word.appendChild(char);
            chars.push(char);
          });

          words.push(word);
          fragment.appendChild(word);
        });

        el.appendChild(fragment);

        return {
          el: el,
          original: original,
          chars: chars,
          words: words
        };
      }


      var beforeType = buildCharacters(beforeEl);
      var strikeType = buildCharacters(strikeEl);
      var afterType = buildCharacters(afterEl);


      // =====================================================
      // MULTILINE STRIKE
      // =====================================================

      var strikeLayer = null;
      var strikeSegments = [];
      var MAX_STRIKE_LINES = 6;


      function createStrikeLayer() {
        if (!rewrite || !strikeEl || !strikeType) return;

        if (getComputedStyle(rewrite).position === "static") {
          rewrite.style.position = "relative";
        }

        strikeLayer = document.createElement("div");

        Object.assign(strikeLayer.style, {
          position: "absolute",
          inset: "0",
          pointerEvents: "none",
          overflow: "visible",
          zIndex: "10"
        });

        rewrite.appendChild(strikeLayer);

        for (var i = 0; i < MAX_STRIKE_LINES; i++) {
          var line = document.createElement("div");

          Object.assign(line.style, {
            position: "absolute",
            height: "3px",
            backgroundColor: getComputedStyle(strikeEl).color,
            transformOrigin: "left center",
            pointerEvents: "none",
            display: "none"
          });

          strikeLayer.appendChild(line);
          strikeSegments.push(line);
        }

        gsap.set(strikeSegments, {
          scaleX: 0,
          opacity: 1
        });

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
            segment.style.display = "none";
            return;
          }

          var lineHeight = line.bottom - line.top;

          var y =
            line.top -
            parentRect.top +
            lineHeight * 0.52;

          segment.style.display = "block";

          segment.style.left =
            (line.left - parentRect.left) + "px";

          segment.style.top =
            (y - 1.5) + "px";

          segment.style.width =
            (line.right - line.left) + "px";

          segment.style.backgroundColor =
            getComputedStyle(strikeEl).color;
        });
      }


      createStrikeLayer();


      // =====================================================
      // BLOCK 5 — FINAL TABLE
      // =====================================================

      var finalRows =
        gsap.utils.toArray(
          blocks[4].querySelectorAll(
            "[data-ftx-row], .ftx-row"
          )
        );


      // =====================================================
      // COUNTERS
      // =====================================================

      var counters =
        gsap.utils
          .toArray(
            blocks[4].querySelectorAll(
              "[data-ftx-count]"
            )
          )
          .map(function (el) {

            var raw = String(
              el.dataset.ftxCount || ""
            )
              .replace(/,/g, "")
              .trim();

            var target = Number(raw);

            if (!Number.isFinite(target)) {
              console.warn("Bad FTX counter:", el, raw);
              return null;
            }

            var prefix =
              el.dataset.ftxPrefix || "";

            var suffix =
              el.dataset.ftxSuffix || "";

            var decimals =
              raw.includes(".")
                ? raw.split(".")[1].length
                : 0;

            var originalText =
              el.textContent;

            var state = {
              value: 0
            };


            function render() {
              var number;

              if (decimals > 0) {
                number =
                  state.value.toFixed(decimals);
              } else {
                number =
                  Math.round(state.value)
                    .toLocaleString();
              }

              el.textContent =
                prefix +
                number +
                suffix;
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


      // =====================================================
      // INITIAL STATES
      // =====================================================

      gsap.set(camera, {
        scale: 1,
        x: 0,
        y: 0
      });

      applyCameraFocus();

      gsap.set(background, {
        autoAlpha: 1
      });


      if (face) {
        gsap.set(face, {
          autoAlpha: 0,
          x: 0,
          y: 0
        });
      }


      if (money) {
        gsap.set(money, {
          autoAlpha: 1,
          x: 0,
          y: MONEY_START
        });
      }


      blocks.forEach(function (block, i) {
        gsap.set(block, {
          autoAlpha:
            i === 0 ? 1 : 0
        });
      });


      if (rewrite) {
        gsap.set(rewrite, {
          autoAlpha: 1
        });
      }


      // Convictions:
      // block/title can appear,
      // but rows wait.

      if (convictionRows.length) {
        gsap.set(convictionRows, {
          autoAlpha: 0,
          y: 14
        });
      }


      // Final table:
      // exact same idea.

      if (finalRows.length) {
        gsap.set(finalRows, {
          autoAlpha: 0,
          y: 14
        });
      }


      // =====================================================
      // TIMELINE
      // =====================================================

      var ftxTimeline =
        gsap.timeline({
          scrollTrigger: {
            id: "ftx-" + index,
            trigger: track,
            start: "top top",
            end: "bottom bottom",
            scrub: 0.45,
            invalidateOnRefresh: true
          }
        });


      // =====================================================
      // HELPERS
      // =====================================================

      function fadeOutBlock(block, at) {
        if (!block) return at;

        ftxTimeline.to(
          block,
          {
            autoAlpha: 0,
            duration: TEXT_FADE,
            ease: "power2.in"
          },
          at
        );

        return at + TEXT_FADE;
      }


      function fadeInBlock(block, at) {
        if (!block) return at;

        ftxTimeline.to(
          block,
          {
            autoAlpha: 1,
            duration: TEXT_FADE,
            ease: TEXT_EASE
          },
          at
        );

        return at + TEXT_FADE;
      }


      function transitionBlocks(
        outgoing,
        incoming,
        at
      ) {
        // Absolutely no crossfade.

        at = fadeOutBlock(outgoing, at);
        at = fadeInBlock(incoming, at);

        return at;
      }


      function revealRows(rows, at) {
        rows.forEach(function (row) {

          ftxTimeline.to(
            row,
            {
              autoAlpha: 1,
              y: 0,
              duration: ROW_FADE,
              ease: "power2.out"
            },
            at
          );

          // Row must finish before next row.
          at += ROW_FADE + ROW_GAP;
        });

        return at;
      }


      function typeCharacters(
        target,
        duration,
        at
      ) {
        if (!target || !target.chars.length) {
          return at + duration;
        }

        var step =
          duration /
          Math.max(
            1,
            target.chars.length - 1
          );

        target.chars.forEach(
          function (char, i) {

            ftxTimeline.set(
              char,
              {
                visibility: "visible"
              },
              at + step * i
            );
          }
        );

        return at + duration;
      }


      function animateCounter(
        counter,
        at
      ) {
        counter.state.value = 0;
        counter.render();

        ftxTimeline.to(
          counter.state,
          {
            value: counter.target,
            duration: COUNTER_DURATION,
            ease: "power2.out",
            onUpdate: counter.render
          },
          at
        );
      }


      // =====================================================
      // STORY
      // =====================================================

      var at = 0;


      // =====================================================
      // BLOCK 1
      // =====================================================

      at += INTRO_HOLD;


      // =====================================================
      // BLOCK 1 → 2
      // =====================================================

      at =
        transitionBlocks(
          blocks[0],
          blocks[1],
          at
        );


      if (face) {
        ftxTimeline.to(
          face,
          {
            autoAlpha: 1,
            duration: FACE_FADE,
            ease: "power2.out"
          },
          at
        );

        at += FACE_FADE;
      }


      if (money) {
        ftxTimeline.to(
          money,
          {
            y: 0,
            duration: MONEY_IN,
            ease: "power3.out"
          },
          at
        );
      }


      at +=
        Math.max(
          BLOCK_HOLD,
          MONEY_IN
        );


      // =====================================================
      // BLOCK 2 → 3
      //
      // CONVICTIONS TABLE
      // =====================================================

      at =
        transitionBlocks(
          blocks[1],
          blocks[2],
          at
        );


      // Block 3 has now fully faded in.
      // Because its rows began hidden,
      // only its title/header is showing.


      // Small title-only beat.

      at += BLOCK_HOLD;


      // Now conviction rows appear one at a time.

      at =
        revealRows(
          convictionRows,
          at
        );


      // Small completed-table hold.

      at += BLOCK_HOLD;


      // =====================================================
      // CAMERA ZOOM START
      // =====================================================

      var zoomStart = at;


      // =====================================================
      // BLOCK 3 → 4
      //
      // REWRITE
      // =====================================================

      at =
        transitionBlocks(
          blocks[2],
          blocks[3],
          at
        );


      // =====================================================
      // TYPE FIRST PART
      // =====================================================

      at =
        typeCharacters(
          beforeType,
          TYPE_BEFORE,
          at
        );


      // =====================================================
      // TYPE CHARITY PHRASE
      // =====================================================

      at =
        typeCharacters(
          strikeType,
          TYPE_STRIKE,
          at
        );


      at +=
        BEFORE_STRIKE_PAUSE;


      // =====================================================
      // DRAW STRIKE
      // =====================================================

      if (strikeSegments.length) {

        ftxTimeline.to(
          strikeSegments,
          {
            scaleX: 1,
            duration: STRIKE_DURATION,
            ease: "power2.out"
          },
          at
        );

        at +=
          STRIKE_DURATION;
      }


      // =====================================================
      // DIM STRUCK TEXT + LINE
      // =====================================================

      if (
        strikeType &&
        strikeType.chars.length
      ) {

        ftxTimeline.to(
          [
            ...strikeType.chars,
            ...strikeSegments
          ],
          {
            opacity: STRIKE_DIM,
            duration:
              STRIKE_DIM_DURATION,
            ease:
              "power2.out"
          },
          at
        );

        at +=
          STRIKE_DIM_DURATION;
      }


      at +=
        AFTER_STRIKE_PAUSE;


      // =====================================================
      // TYPE REPLACEMENT
      // =====================================================

      at =
        typeCharacters(
          afterType,
          TYPE_AFTER,
          at
        );


      at +=
        REWRITE_HOLD;


      if (money) {
        ftxTimeline.to(
          money,
          {
            x: "-25vw",
            y: "20vh",
            duration: 0.60,
            ease: "power2.inOut"
          },
          at - REWRITE_HOLD
        );
      }


      // =====================================================
      // BLOCK 4 → 5
      //
      // FINAL TABLE
      // =====================================================

      at =
        transitionBlocks(
          blocks[3],
          blocks[4],
          at
        );


      // Exactly like convictions:
      // title/header is now visible,
      // rows remain hidden.

      at += BLOCK_HOLD;


      // =====================================================
      // FINAL TABLE ROWS
      //
      // Row appears → counter counts
      // → next row.
      // =====================================================

      finalRows.forEach(function (row) {

        // -----------------------------
        // ROW
        // -----------------------------

        ftxTimeline.to(
          row,
          {
            autoAlpha: 1,
            y: 0,
            duration: ROW_FADE,
            ease: "power2.out"
          },
          at
        );

        at += ROW_FADE;


        // -----------------------------
        // COUNTER(S) IN THIS ROW
        // -----------------------------

        var rowCounters =
          counters.filter(
            function (counter) {
              return row.contains(
                counter.el
              );
            }
          );


        rowCounters.forEach(
          function (counter) {

            animateCounter(
              counter,
              at
            );
          }
        );


        if (rowCounters.length) {
          at += COUNTER_DURATION;
        }


        at += ROW_GAP;
      });


      // =====================================================
      // COUNTERS NOT INSIDE A ROW
      // =====================================================

      var looseCounters =
        counters.filter(
          function (counter) {

            return !finalRows.some(
              function (row) {

                return row.contains(
                  counter.el
                );
              }
            );
          }
        );


      if (looseCounters.length) {

        looseCounters.forEach(
          function (counter) {

            animateCounter(
              counter,
              at
            );
          }
        );

        at += COUNTER_DURATION;
      }


      // =====================================================
      // FINAL HOLD
      // =====================================================

      ftxTimeline.to(
        {},
        {
          duration: FINAL_HOLD
        },
        at
      );

      at += FINAL_HOLD;


      // =====================================================
      // CAMERA ZOOM
      // =====================================================

      var zoomDuration =
        ftxTimeline.duration() -
        zoomStart;


      if (zoomDuration > 0) {

        ftxTimeline.to(
          camera,
          {
            scale: FINAL_ZOOM,
            x: 0,
            y: 0,
            duration: zoomDuration,
            ease: "none"
          },
          zoomStart
        );
      }


      // =====================================================
      // RESIZE / REFLOW
      // =====================================================

      function refreshGeometry() {
        applyCameraFocus();
        updateStrikeGeometry();
      }


      function onResize() {
        refreshGeometry();
        ScrollTrigger.refresh();
      }


      window.addEventListener(
        "resize",
        onResize
      );


      if (
        document.fonts &&
        document.fonts.ready
      ) {

        document.fonts.ready.then(
          function () {

            refreshGeometry();
            ScrollTrigger.refresh();
          }
        );
      }


      requestAnimationFrame(
        function () {

          refreshGeometry();
          ScrollTrigger.refresh();
        }
      );


      // =====================================================
      // CLEANUP
      // =====================================================

      return function () {

        window.removeEventListener(
          "resize",
          onResize
        );


        if (
          strikeLayer &&
          strikeLayer.parentNode
        ) {

          strikeLayer.parentNode
            .removeChild(
              strikeLayer
            );
        }


        if (beforeType) {
          beforeType.el.textContent =
            beforeType.original;
        }

        if (strikeType) {
          strikeType.el.textContent =
            strikeType.original;
        }

        if (afterType) {
          afterType.el.textContent =
            afterType.original;
        }


        counters.forEach(
          function (counter) {

            counter.el.textContent =
              counter.originalText;
          }
        );
      };
    });
  });
}


if (document.readyState === "loading") {

  document.addEventListener(
    "DOMContentLoaded",
    initFTX
  );

} else {

  initFTX();
}

// ftx end

document.addEventListener("DOMContentLoaded", function () {

  gsap.registerPlugin(ScrollTrigger);

  gsap.utils
    .toArray("[data-askell-scene]")
    .forEach(function (sec, index) {

      // =====================================================
      // ELEMENTS
      // =====================================================

      var track =
        sec.querySelector(
          "[data-askell-track]"
        );

      var introGroup =
        sec.querySelector(
          "[data-askell-intro-group]"
        );

      var title =
        sec.querySelector(
          "[data-askell-title]"
        );

      var body =
        sec.querySelector(
          "[data-askell-body]"
        );

      var person =
        sec.querySelector(
          "[data-askell-person]"
        );

      var personMedia =
        person
          ? person.querySelector(
              ".askell_person-media"
            )
          : null;

      var innerTitle =
        sec.querySelector(
          "[data-askell-inner-title]"
        );

      var floats =
        gsap.utils.toArray(
          sec.querySelectorAll(
            "[data-askell-float]"
          )
        );

      var quotes =
        gsap.utils.toArray(
          sec.querySelectorAll(
            "[data-askell-quote]"
          )
        );


      // =====================================================
      // VALIDATE
      // =====================================================

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
        console.warn(
          "Askell section missing required element.",
          {
            track: track,
            introGroup: introGroup,
            title: title,
            body: body,
            person: person,
            innerTitle: innerTitle,
            floats: floats.length,
            quotes: quotes.length
          }
        );

        return;
      }


      // =====================================================
      // DUPLICATE GUARD
      // =====================================================

      if (
        sec.dataset
          .askellInitialized ===
        "true"
      ) {
        console.warn(
          "Askell already initialized — skipping duplicate.",
          sec
        );

        return;
      }

      sec.dataset
        .askellInitialized =
        "true";


      // =====================================================
      // GLOBAL MOTION
      // =====================================================

      var TEXT_FADE =
        MOTION.textFade.duration;

      var TEXT_EASE =
        MOTION.textFade.ease;


      // =====================================================
      // CONFIG
      // =====================================================

      var TEXT_RISE = 24;

      var EMPTY_HOLD = 0.55;

      var TITLE_HOLD = 0.30;

      var BODY_HOLD = 0.90;

      var PERSON_IN = 0.85;

      var FLOAT_IN = 0.45;

      var FLOAT_HOLD = 1.15;

      var FLOAT_OUT = 0.60;

      var QUOTE_HOLD = 1.05;

      var FINAL_HOLD = 1.40;


      // =====================================================
      // DESKTOP
      // =====================================================

      gsap
        .matchMedia()
        .add(
          "(min-width: 992px)",
          function () {


            // =================================================
            // INITIAL STATES
            // =================================================

            gsap.set(
              introGroup,
              {
                y: 0
              }
            );


            // Intro title
            // WHOLE ELEMENT

            gsap.set(
              title,
              {
                autoAlpha: 0,
                y: TEXT_RISE
              }
            );


            // Intro body
            // WHOLE ELEMENT

            gsap.set(
              body,
              {
                autoAlpha: 0,
                y: TEXT_RISE
              }
            );


            // Amanda begins below viewport

            gsap.set(
              person,
              {
                y: "110vh"
              }
            );


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


            // Floating labels hidden initially

            gsap.set(
              floats,
              {
                autoAlpha: 0,
                y: 0
              }
            );


            // New text beside Amanda
            // visible once Amanda is on-screen

            gsap.set(
              innerTitle,
              {
                autoAlpha: 1
              }
            );


            // Quotes all occupy the same visual slot,
            // but start hidden

            gsap.set(
              quotes,
              {
                autoAlpha: 0
              }
            );


            // =================================================
            // AMANDA FLOAT
            //
            // KEEPING EXISTING MOTION
            // =================================================

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

                    ease:
                      "sine.inOut",

                    repeat: -1,

                    yoyo: true
                  }
                );

            }


            // =================================================
            // FLOATING LABELS
            //
            // ONLY THE 3 ELEMENTS THAT EXIST.
            // =================================================

            var floatTweens = [];


            var floatMotion = [

              {
                x: -13,
                y: -8,
                rotation: -1.5,
                duration: 2.3
              },

              {
                x: 10,
                y: 12,
                rotation: 1.2,
                duration: 2.52
              },

              {
                x: -8,
                y: 14,
                rotation: -1,
                duration: 2.74
              }

            ];


            floats.forEach(
              function (float, i) {

                var inner =
                  float.querySelector(
                    ".askell_float-inner"
                  ) ||
                  float;


                var motion =
                  floatMotion[i];

                if (!motion) {
                  return;
                }


                var tween =
                  gsap.to(
                    inner,
                    {
                      x:
                        motion.x,

                      y:
                        motion.y,

                      rotation:
                        motion.rotation,

                      duration:
                        motion.duration,

                      ease:
                        "sine.inOut",

                      repeat:
                        -1,

                      yoyo:
                        true
                    }
                  );


                floatTweens.push(
                  tween
                );

              }
            );


            // =================================================
            // MASTER TIMELINE
            // =================================================

            var askellTimeline =
              gsap.timeline({

                scrollTrigger: {

                  id:
                    "askell-" +
                    index,

                  trigger:
                    track,

                  start:
                    "top top",

                  end:
                    "bottom bottom",

                  scrub:
                    0.5,

                  invalidateOnRefresh:
                    true

                }

              });


            // =================================================
            // 0. BACKGROUND ONLY
            // =================================================

            askellTimeline.to(
              {},
              {
                duration:
                  EMPTY_HOLD
              }
            );


            // =================================================
            // 1. INTRO TITLE
            //
            // WHOLE ELEMENT
            // =================================================

            askellTimeline.to(
              title,
              {
                autoAlpha: 1,

                y: 0,

                duration:
                  TEXT_FADE,

                ease:
                  TEXT_EASE
              }
            );


            askellTimeline.to(
              {},
              {
                duration:
                  TITLE_HOLD
              }
            );


            // =================================================
            // 2. INTRO BODY
            //
            // WHOLE ELEMENT
            // =================================================

            askellTimeline.to(
              body,
              {
                autoAlpha: 1,

                y: 0,

                duration:
                  TEXT_FADE,

                ease:
                  TEXT_EASE
              }
            );


            askellTimeline.to(
              {},
              {
                duration:
                  BODY_HOLD
              }
            );


            // =================================================
            // 3. AMANDA RISES
            // =================================================

            askellTimeline.to(
              person,
              {
                y: 0,

                duration:
                  PERSON_IN,

                ease:
                  "power3.out"
              }
            );


            // Intro leaves simultaneously

            askellTimeline.to(
              introGroup,
              {
                y:
                  "-115vh",

                duration:
                  PERSON_IN,

                ease:
                  "power3.inOut"
              },
              "<"
            );


            // =================================================
            // 4. FLOATING LABELS ENTER
            // =================================================

            askellTimeline.to(
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


            askellTimeline.to(
              {},
              {
                duration:
                  FLOAT_HOLD
              }
            );


            // =================================================
            // 5. FLOATING LABELS LEAVE
            // =================================================

            askellTimeline.to(
              floats,
              {
                autoAlpha: 0,

                y:
                  "-55vh",

                duration:
                  FLOAT_OUT,

                ease:
                  "power2.in",

                stagger: {
                  each: 0.045
                }
              }
            );


            // =================================================
            // 6. INNER TITLE → QUOTE 1
            //
            // DIRECT CROSSFADE.
            // SAME POSITION.
            // =================================================

            askellTimeline.to(
              innerTitle,
              {
                autoAlpha: 0,

                duration:
                  TEXT_FADE,

                ease:
                  TEXT_EASE
              }
            );


            askellTimeline.to(
              quotes[0],
              {
                autoAlpha: 1,

                duration:
                  TEXT_FADE,

                ease:
                  TEXT_EASE
              },
              "<"
            );


            askellTimeline.to(
              {},
              {
                duration:
                  QUOTE_HOLD
              }
            );


            // =================================================
            // 7. QUOTE 1 → QUOTE 2
            // =================================================

            askellTimeline.to(
              quotes[0],
              {
                autoAlpha: 0,

                duration:
                  TEXT_FADE,

                ease:
                  TEXT_EASE
              }
            );


            askellTimeline.to(
              quotes[1],
              {
                autoAlpha: 1,

                duration:
                  TEXT_FADE,

                ease:
                  TEXT_EASE
              },
              "<"
            );


            askellTimeline.to(
              {},
              {
                duration:
                  QUOTE_HOLD
              }
            );


            // =================================================
            // 8. QUOTE 2 → QUOTE 3
            // =================================================

            askellTimeline.to(
              quotes[1],
              {
                autoAlpha: 0,

                duration:
                  TEXT_FADE,

                ease:
                  TEXT_EASE
              }
            );


            askellTimeline.to(
              quotes[2],
              {
                autoAlpha: 1,

                duration:
                  TEXT_FADE,

                ease:
                  TEXT_EASE
              },
              "<"
            );


            // =================================================
            // FINAL HOLD
            //
            // Quote 3 remains.
            // =================================================

            askellTimeline.to(
              {},
              {
                duration:
                  FINAL_HOLD
              }
            );


            // =================================================
            // REFRESH
            // =================================================

            requestAnimationFrame(
              function () {

                ScrollTrigger.refresh();

              }
            );


            // =================================================
            // CLEANUP
            // =================================================

            return function () {

              if (personFloat) {
                personFloat.kill();
              }


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
// - where is claude
/*
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
*/

document.addEventListener("DOMContentLoaded", function () {
  gsap.registerPlugin(ScrollTrigger);

  gsap.utils
    .toArray("[data-fam-scene]")
    .forEach(function (sec, index) {
      var q = gsap.utils.selector(sec);

      var track =
        q("[data-fam-track]")[0];

      var rail =
        q("[data-fam-rail]")[0];

      var band =
        q("[data-fam-band]")[0];

      var cards =
        q("[data-fam-card]");

      var items =
        q("[data-fam-item]");

      var title =
        q("[data-fam-title]")[0] ||
        items[0];

      var quote =
        q("[data-fam-quote]")[0] ||
        items[1];

      // ---------------------------------
      // VALIDATE FIRST
      // ---------------------------------

      if (
        !track ||
        !rail ||
        !band ||
        !cards.length ||
        !title ||
        !quote
      ) {
        console.warn(
          "Family section missing:",
          {
            track: track,
            rail: rail,
            band: band,
            cards: cards.length,
            items: items.length,
            title: title,
            quote: quote
          }
        );

        return;
      }

      // ---------------------------------
      // DUPLICATE GUARD
      //
      // ONLY AFTER successful validation
      // ---------------------------------

      if (
        sec.dataset.famInitialized ===
        "true"
      ) {
        console.warn(
          "Family already initialized — skipping duplicate.",
          sec
        );

        return;
      }

      sec.dataset.famInitialized =
        "true";

      // ---------------------------------
      // GLOBAL MOTION
      // ---------------------------------

      var TEXT_FADE =
        MOTION.textFade.duration;

      var TEXT_EASE =
        MOTION.textFade.ease;

      // ---------------------------------
      // CONFIG
      // ---------------------------------

      var END_GUTTER = 48;

      // Very fast opening
      var TITLE_AT = 0;
      var QUOTE_AT = 0.04;

      var ROW_DURATION = 0.55;
      var ROW_HOLD = 0.18;

      var HORIZONTAL_DURATION = 2.2;
      var FINAL_HOLD = 0.2;

      gsap.matchMedia().add(
        "(min-width: 992px)",
        function () {
          // ---------------------------------
          // INITIAL STATES
          // ---------------------------------

          // Rail genuinely starts below.
          // No fromTo / immediateRender conflict.

          gsap.set(rail, {
            x: 0,
            y: "105vh"
          });

          gsap.set(band, {
            y: "105vh"
          });

          gsap.set(cards, {
            opacity: 1,
            scale: 1
          });

          gsap.set(
            q("[data-fam-role]"),
            {
              opacity: 1
            }
          );

          // Whole-element text fade

          gsap.set(title, {
            opacity: 0
          });

          gsap.set(quote, {
            opacity: 0
          });

          // ---------------------------------
          // HORIZONTAL ENDPOINT
          // ---------------------------------

          function getHorizontalEnd() {
            var lastCard =
              cards[
                cards.length - 1
              ];

            if (!lastCard) {
              return 0;
            }

            var currentX =
              parseFloat(
                gsap.getProperty(
                  rail,
                  "x"
                )
              ) || 0;

            var rect =
              lastCard
                .getBoundingClientRect();

            var lastRightAtZero =
              rect.right -
              currentX;

            var desiredRight =
              window.innerWidth -
              END_GUTTER;

            var distance =
              desiredRight -
              lastRightAtZero;

            return Math.min(
              0,
              distance
            );
          }

          // ---------------------------------
          // MASTER TIMELINE
          // ---------------------------------

          var familyTimeline =
            gsap.timeline({
              scrollTrigger: {
                id:
                  "family-" +
                  index,

                trigger:
                  track,

                start:
                  "top top",

                end:
                  "bottom bottom",

                scrub:
                  0.4,

                invalidateOnRefresh:
                  true
              }
            });

          // ---------------------------------
          // 1. TITLE
          // ---------------------------------

          familyTimeline.to(
            title,
            {
              opacity: 1,

              duration:
                TEXT_FADE,

              ease:
                TEXT_EASE
            },
            TITLE_AT
          );

          // ---------------------------------
          // 2. QUOTE
          //
          // Starts basically immediately.
          // ---------------------------------

          familyTimeline.to(
            quote,
            {
              opacity: 1,

              duration:
                TEXT_FADE,

              ease:
                TEXT_EASE
            },
            QUOTE_AT
          );

          // ---------------------------------
          // 3. RAIL + BAND RISE
          // ---------------------------------

          var ROW_AT =
            QUOTE_AT +
            TEXT_FADE +
            0.08;

          familyTimeline.to(
            rail,
            {
              y: 0,

              duration:
                ROW_DURATION,

              ease:
                "power3.out"
            },
            ROW_AT
          );

          familyTimeline.to(
            band,
            {
              y: 0,

              duration:
                ROW_DURATION,

              ease:
                "power3.out"
            },
            ROW_AT
          );

          // ---------------------------------
          // 4. HORIZONTAL RAIL
          // ---------------------------------

          var HORIZONTAL_AT =
            ROW_AT +
            ROW_DURATION +
            ROW_HOLD;

          familyTimeline.to(
            rail,
            {
              x: function () {
                return getHorizontalEnd();
              },

              duration:
                HORIZONTAL_DURATION,

              ease:
                "none"
            },
            HORIZONTAL_AT
          );

          // ---------------------------------
          // 5. FINAL HOLD
          // ---------------------------------

          familyTimeline.to(
            {},
            {
              duration:
                FINAL_HOLD
            }
          );

          requestAnimationFrame(
            function () {
              ScrollTrigger.refresh();
            }
          );

          // ---------------------------------
          // CLEANUP
          // ---------------------------------

          return function () {
            gsap.set(
              rail,
              {
                clearProps:
                  "transform"
              }
            );

            gsap.set(
              band,
              {
                clearProps:
                  "transform"
              }
            );
          };
        }
      );
    });
});
/*
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
*/
document.addEventListener("DOMContentLoaded", function () {

  gsap.registerPlugin(ScrollTrigger);


  gsap.utils
    .toArray("[data-scandal-scene]")
    .forEach(function (sec) {


      // =========================================================
      // ELEMENTS
      // =========================================================

      var cards =
        gsap.utils.toArray(
          sec.querySelectorAll("[data-scandal-card]")
        );

      var scandalsGrid =
        sec.querySelector(".scandals_grid");

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
        !scandalsGrid ||
        !reader ||
        !readerVisual ||
        !readerContent ||
        !readerImage ||
        !closeBtn ||
        !stories.length
      ) {

        console.warn(
          "Scandals: missing required elements.",
          {
            cards: cards.length,
            scandalsGrid: !!scandalsGrid,
            reader: !!reader,
            readerVisual: !!readerVisual,
            readerContent: !!readerContent,
            readerImage: !!readerImage,
            closeBtn: !!closeBtn,
            stories: stories.length
          }
        );

        return;
      }


      // =========================================================
      // SETTINGS
      // =========================================================

      var OPEN_DURATION = 0.72;
      var OPEN_EASE = "power4.inOut";

      var SWAP_OUT_DURATION = 0.18;
      var SWAP_IN_DURATION = 0.22;


      // =========================================================
      // STATE
      // =========================================================

      var currentCard = null;
      var currentStory = null;
      var currentIndex = -1;

      var isOpen = false;
      var isAnimating = false;

      var openGeometry = null;
      var gridGhost = null;

      var oldBodyOverflow = "";
      var oldHtmlOverflow = "";


      // =========================================================
      // READER ROOT
      //
      // Fixed transparent viewport overlay.
      // =========================================================

      gsap.set(reader, {

        position:
          "fixed",

        inset:
          0,

        width:
          "100vw",

        height:
          "100vh",

        margin:
          0,

        backgroundColor:
          "transparent",

        zIndex:
          9990
      });


      // =========================================================
      // INITIAL STATE
      // =========================================================

      reader.setAttribute(
        "aria-hidden",
        "true"
      );


      gsap.set(reader, {

        autoAlpha:
          0,

        pointerEvents:
          "none"
      });


      gsap.set(stories, {

        display:
          "none"
      });


      // =========================================================
      // INTRO
      // =========================================================

      if (
        intro &&
        introTrack
      ) {

        gsap.to(intro, {

          autoAlpha:
            0,

          ease:
            "none",

          scrollTrigger: {

            trigger:
              introTrack,

            start:
              "top top",

            end:
              "+=1000",

            scrub:
              true
          }
        });
      }


      // =========================================================
      // CARD ACCESSIBILITY
      // =========================================================

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


      // =========================================================
      // HELPERS
      // =========================================================

      function getStoryForCard(card) {

        var id =
          card.getAttribute(
            "data-story"
          );


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

          readerImage.src =
            src;
        }


        readerImage.alt =
          source.alt || "";


        var styles =
          getComputedStyle(source);


        readerImage.style.objectPosition =
          styles.objectPosition;
      }


      function activateStory(story) {

        stories.forEach(
          function (item) {

            item.classList.remove(
              "is-active"
            );


            gsap.set(
              item,
              {
                display:
                  "none"
              }
            );
          }
        );


        story.classList.add(
          "is-active"
        );


        gsap.set(
          story,
          {
            display:
              "block"
          }
        );
      }


      // =========================================================
      // PAGE LOCK
      // =========================================================

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


      // =========================================================
      // GRID GHOST
      //
      // Frozen copy of the visible four-card grid underneath
      // the reader transition.
      // =========================================================

      function createGridGhost() {

        removeGridGhost();


        var rect =
          scandalsGrid.getBoundingClientRect();


        gridGhost =
          scandalsGrid.cloneNode(true);


        gridGhost.setAttribute(
          "aria-hidden",
          "true"
        );


        gridGhost.setAttribute(
          "data-scandal-grid-ghost",
          "true"
        );


        // ---------------------------------------------
        // REMOVE DUPLICATE IDS
        // ---------------------------------------------

        if (gridGhost.id) {

          gridGhost.removeAttribute(
            "id"
          );
        }


        gridGhost
          .querySelectorAll("[id]")
          .forEach(function (el) {

            el.removeAttribute(
              "id"
            );
          });


        // ---------------------------------------------
        // PURELY VISUAL
        // ---------------------------------------------

        gridGhost
          .querySelectorAll("*")
          .forEach(function (el) {

            el.style.pointerEvents =
              "none";
          });


        Object.assign(
          gridGhost.style,
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

            margin:
              "0",

            zIndex:
              "9980",

            pointerEvents:
              "none",

            opacity:
              "1",

            visibility:
              "visible",

            transform:
              "none"
          }
        );


        document.body.appendChild(
          gridGhost
        );
      }


      function removeGridGhost() {

        if (!gridGhost) {
          return;
        }


        gridGhost.remove();

        gridGhost =
          null;
      }


      // =========================================================
      // TRANSITION IMAGE
      // =========================================================

      function createTransitionImage(
        source,
        rect
      ) {

        if (!source) {
          return null;
        }


        var styles =
          getComputedStyle(source);


        var clone =
          document.createElement("img");


        clone.src =
          source.currentSrc ||
          source.src;

        clone.alt =
          "";


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

            maxWidth:
              "none",

            maxHeight:
              "none",

            pointerEvents:
              "none",

            zIndex:
              "99999",

            transform:
              "none",

            willChange:
              "left,width"
          }
        );


        document.body.appendChild(
          clone
        );


        return clone;
      }


      // =========================================================
      // CLEAR TEMP READER GEOMETRY
      // =========================================================

      function clearReaderGeometry() {

        gsap.set(
          readerVisual,
          {

            clearProps:
              "position,left,top,right,bottom,width,height,margin,transform,overflow"
          }
        );


        gsap.set(
          readerContent,
          {

            clearProps:
              "position,left,top,right,bottom,width,height,margin,transform,overflow"
          }
        );


        if (readerScroll) {

          gsap.set(
            readerScroll,
            {

              clearProps:
                "width,height,minWidth"
            }
          );
        }
      }


      // =========================================================
      // OPEN
      // =========================================================

      function openStory(card) {

        if (
          isOpen ||
          isAnimating
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
          return;
        }


        isAnimating =
          true;


        currentCard =
          card;

        currentStory =
          story;

        currentIndex =
          cards.indexOf(card);


        // =====================================================
        // SOURCE RECT
        // =====================================================

        var sourceRect =
          sourceImage
            .getBoundingClientRect();


        // =====================================================
        // FREEZE CURRENT FOUR-CARD GRID
        // =====================================================

        createGridGhost();


        // =====================================================
        // PREPARE READER
        // =====================================================

        setReaderImage(card);

        activateStory(story);


        if (readerScroll) {

          readerScroll.scrollTop =
            0;
        }


        reader.classList.add(
          "is-open"
        );


        reader.setAttribute(
          "aria-hidden",
          "false"
        );


        gsap.set(
          reader,
          {

            autoAlpha:
              1,

            pointerEvents:
              "auto",

            backgroundColor:
              "transparent"
          }
        );


        // =====================================================
        // FINAL IMAGE WIDTH
        //
        // Use Designer width only.
        // Final image left is always 0.
        // =====================================================

        var designerVisualRect =
          readerVisual
            .getBoundingClientRect();


        var finalImageWidth =
          designerVisualRect.width;


        if (!finalImageWidth) {

          finalImageWidth =
            window.innerWidth * 0.5;
        }


        finalImageWidth =
          Math.min(
            finalImageWidth,
            window.innerWidth
          );


        // =====================================================
        // GEOMETRY
        // =====================================================

        var geometry = {


          // SOURCE

          sourceLeft:
            sourceRect.left,

          sourceRight:
            sourceRect.right,

          sourceTop:
            sourceRect.top,

          sourceWidth:
            sourceRect.width,

          sourceHeight:
            sourceRect.height,


          // FINAL IMAGE

          imageLeft:
            0,

          imageTop:
            sourceRect.top,

          imageWidth:
            finalImageWidth,

          imageHeight:
            sourceRect.height,


          // FINAL READER

          contentLeft:
            finalImageWidth,

          contentTop:
            sourceRect.top,

          contentWidth:
            window.innerWidth -
            finalImageWidth,

          contentHeight:
            sourceRect.height
        };


        openGeometry =
          geometry;


        // =====================================================
        // TRANSITION IMAGE
        // =====================================================

        var transitionImage =
          createTransitionImage(
            sourceImage,
            sourceRect
          );


        if (!transitionImage) {

          removeGridGhost();

          isAnimating =
            false;

          return;
        }


        // =====================================================
        // REAL READER IMAGE
        // =====================================================

        gsap.set(
          readerVisual,
          {

            position:
              "fixed",

            left:
              geometry.imageLeft,

            top:
              geometry.imageTop,

            width:
              geometry.imageWidth,

            height:
              geometry.imageHeight,

            margin:
              0,

            x:
              0,

            y:
              0,

            xPercent:
              0,

            yPercent:
              0,

            autoAlpha:
              0,

            overflow:
              "hidden"
          }
        );


        // =====================================================
        // RIGHT PANEL
        //
        // Starts at clicked image's right edge with zero width.
        // =====================================================

        gsap.set(
          readerContent,
          {

            position:
              "fixed",

            left:
              geometry.sourceRight,

            top:
              geometry.contentTop,

            width:
              0,

            height:
              geometry.contentHeight,

            margin:
              0,

            x:
              0,

            y:
              0,

            xPercent:
              0,

            yPercent:
              0,

            overflow:
              "hidden"
          }
        );


        // =====================================================
        // KEEP INNER READER AT FINAL WIDTH
        //
        // Prevents text reflow during expansion.
        // =====================================================

        if (readerScroll) {

          gsap.set(
            readerScroll,
            {

              width:
                geometry.contentWidth,

              minWidth:
                geometry.contentWidth,

              height:
                "100%"
            }
          );
        }


        // =====================================================
        // INITIAL STORY STATE
        // =====================================================

        gsap.set(
          currentStory,
          {

            autoAlpha:
              0,

            x:
              0,

            y:
              0
          }
        );


        gsap.set(
          closeBtn,
          {

            autoAlpha:
              0,

            scale:
              0.9
          }
        );


        lockPage();


        // =====================================================
        // OPEN TIMELINE
        // =====================================================

        var tl =
          gsap.timeline({

            onComplete:
              function () {


                gsap.set(
                  readerVisual,
                  {

                    autoAlpha:
                      1
                  }
                );


                transitionImage.remove();


                isOpen =
                  true;

                isAnimating =
                  false;
              }
          });


        // =====================================================
        // IMAGE EXPANDS LEFT
        // =====================================================

        tl.to(
          transitionImage,
          {

            left:
              geometry.imageLeft,

            width:
              geometry.imageWidth,

            duration:
              OPEN_DURATION,

            ease:
              OPEN_EASE
          },
          0
        );


        // =====================================================
        // READER EXPANDS RIGHT
        // =====================================================

        tl.to(
          readerContent,
          {

            left:
              geometry.contentLeft,

            width:
              geometry.contentWidth,

            duration:
              OPEN_DURATION,

            ease:
              OPEN_EASE
          },
          0
        );


        // =====================================================
        // STORY IN
        // =====================================================

        tl.to(
          currentStory,
          {

            autoAlpha:
              1,

            duration:
              0.25,

            ease:
              "power2.out"
          },
          0.42
        );


        // =====================================================
        // CLOSE BUTTON IN
        // =====================================================

        tl.to(
          closeBtn,
          {

            autoAlpha:
              1,

            scale:
              1,

            duration:
              0.22,

            ease:
              "power2.out"
          },
          0.48
        );
      }


      // =========================================================
      // CLOSE
      // =========================================================

      function closeStory() {

        if (
          !isOpen ||
          isAnimating ||
          !currentCard ||
          !openGeometry
        ) {
          return;
        }


        isAnimating =
          true;


        var geometry =
          openGeometry;


        // =====================================================
        // TRANSITION IMAGE AT FINAL OPEN POSITION
        // =====================================================

        var finalRect = {

          left:
            geometry.imageLeft,

          top:
            geometry.imageTop,

          width:
            geometry.imageWidth,

          height:
            geometry.imageHeight
        };


        var transitionImage =
          createTransitionImage(
            readerImage,
            finalRect
          );


        if (!transitionImage) {

          isAnimating =
            false;

          return;
        }


        // Clone replaces real reader image.

        gsap.set(
          readerVisual,
          {

            autoAlpha:
              0
          }
        );


        // Ensure panel starts fully open.

        gsap.set(
          readerContent,
          {

            left:
              geometry.contentLeft,

            top:
              geometry.contentTop,

            width:
              geometry.contentWidth,

            height:
              geometry.contentHeight
          }
        );


        // =====================================================
        // CLOSE TIMELINE
        // =====================================================

        var tl =
          gsap.timeline({

            onComplete:
              function () {


                transitionImage.remove();


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

                    autoAlpha:
                      0,

                    pointerEvents:
                      "none"
                  }
                );


                // Grid ghost remains until reader disappears.

                removeGridGhost();


                clearReaderGeometry();


                gsap.set(
                  readerVisual,
                  {

                    autoAlpha:
                      1
                  }
                );


                if (currentStory) {

                  currentStory.classList.remove(
                    "is-active"
                  );


                  gsap.set(
                    currentStory,
                    {

                      display:
                        "none",

                      clearProps:
                        "opacity,visibility,transform"
                    }
                  );
                }


                if (readerScroll) {

                  readerScroll.scrollTop =
                    0;
                }


                unlockPage();


                isOpen =
                  false;

                isAnimating =
                  false;


                currentCard =
                  null;

                currentStory =
                  null;

                currentIndex =
                  -1;

                openGeometry =
                  null;
              }
          });


        // =====================================================
        // STORY OUT
        // =====================================================

        tl.to(
          currentStory,
          {

            autoAlpha:
              0,

            duration:
              0.20,

            ease:
              "power2.in"
          },
          0
        );


        // =====================================================
        // BUTTON OUT
        // =====================================================

        tl.to(
          closeBtn,
          {

            autoAlpha:
              0,

            scale:
              0.9,

            duration:
              0.20,

            ease:
              "power2.in"
          },
          0
        );


        // =====================================================
        // IMAGE CONTRACTS
        // =====================================================

        tl.to(
          transitionImage,
          {

            left:
              geometry.sourceLeft,

            width:
              geometry.sourceWidth,

            duration:
              OPEN_DURATION,

            ease:
              OPEN_EASE
          },
          0
        );


        // =====================================================
        // READER CONTRACTS
        // =====================================================

        tl.to(
          readerContent,
          {

            left:
              geometry.sourceRight,

            width:
              0,

            duration:
              OPEN_DURATION,

            ease:
              OPEN_EASE
          },
          0
        );
      }


      // =========================================================
      // NEXT / PREVIOUS
      //
      // VERY SIMPLE:
      //
      // fade current image + story OUT
      // swap
      // fade new image + story IN
      //
      // NO geometry.
      // NO movement.
      // NO scale.
      // =========================================================

function goToStory(index) {

  if (
    !isOpen ||
    isAnimating
  ) {
    return;
  }


  // =====================================================
  // LOOP
  // =====================================================

  if (index < 0) {
    index = cards.length - 1;
  }

  if (index >= cards.length) {
    index = 0;
  }

  if (index === currentIndex) {
    return;
  }


  var nextCard =
    cards[index];

  var nextStory =
    getStoryForCard(nextCard);


  if (!nextStory) {
    return;
  }


  isAnimating = true;


  var oldStory =
    currentStory;


  // =====================================================
  // GET NEXT IMAGE NOW
  //
  // We NEVER animate readerImage opacity.
  // =====================================================

  var nextSource =
    getCardImage(nextCard);


  if (!nextSource) {

    isAnimating = false;

    return;
  }


  var nextSrc =
    nextSource.currentSrc ||
    nextSource.src;


  var nextStyles =
    getComputedStyle(nextSource);


  // =====================================================
  // TIMELINE
  // =====================================================

  var tl =
    gsap.timeline({

      onComplete:
        function () {

          currentIndex =
            index;

          currentCard =
            nextCard;

          currentStory =
            nextStory;

          isAnimating =
            false;
        }
    });


  // =====================================================
  // 1. FADE ONLY OLD STORY/TEXT
  //
  // IMAGE REMAINS 100% VISIBLE.
  // READER BACKGROUND REMAINS UNTOUCHED.
  // =====================================================

  tl.to(
    oldStory,
    {
      autoAlpha: 0,
      duration: 0.18,
      ease: "power1.out"
    }
  );


  // =====================================================
  // 2. INSTANT SWAP
  // =====================================================

  tl.call(function () {


    // ---------------------------------------------
    // INSTANT IMAGE REPLACEMENT
    // ---------------------------------------------

    if (nextSrc) {

      readerImage.src =
        nextSrc;
    }


    readerImage.alt =
      nextSource.alt || "";


    readerImage.style.objectPosition =
      nextStyles.objectPosition;


    // IMPORTANT:
    // Force image to remain fully visible.

    gsap.set(
      readerImage,
      {
        autoAlpha: 1,
        x: 0,
        y: 0,
        scale: 1
      }
    );


    // ---------------------------------------------
    // OLD STORY OFF
    // ---------------------------------------------

    oldStory.classList.remove(
      "is-active"
    );


    gsap.set(
      oldStory,
      {
        display: "none"
      }
    );


    // ---------------------------------------------
    // NEW STORY ON
    // ---------------------------------------------

    activateStory(
      nextStory
    );


    gsap.set(
      nextStory,
      {
        autoAlpha: 0,
        x: 0,
        y: 0,
        scale: 1
      }
    );


    // ---------------------------------------------
    // RESET TEXT SCROLL
    // ---------------------------------------------

    if (readerScroll) {

      readerScroll.scrollTop =
        0;
    }

  });


  // =====================================================
  // 3. FADE ONLY NEW STORY/TEXT IN
  // =====================================================

  tl.to(
    nextStory,
    {
      autoAlpha: 1,
      duration: 0.22,
      ease: "power1.out"
    }
  );

}

      // =========================================================
      // CARD EVENTS
      // =========================================================

      cards.forEach(
        function (card) {


          card.addEventListener(
            "click",
            function (event) {

              event.preventDefault();


              openStory(
                card
              );
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


                openStory(
                  card
                );
              }
            }
          );
        }
      );


      // =========================================================
      // CLOSE
      // =========================================================

      closeBtn.addEventListener(
        "click",
        function (event) {

          event.preventDefault();


          closeStory();
        }
      );


      // =========================================================
      // PREVIOUS
      // =========================================================

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


        // Div accessibility.

        prevBtn.addEventListener(
          "keydown",
          function (event) {

            if (
              event.key === "Enter" ||
              event.key === " "
            ) {

              event.preventDefault();

              prevBtn.click();
            }
          }
        );
      }


      // =========================================================
      // NEXT
      // =========================================================

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


        // Div accessibility.

        nextBtn.addEventListener(
          "keydown",
          function (event) {

            if (
              event.key === "Enter" ||
              event.key === " "
            ) {

              event.preventDefault();

              nextBtn.click();
            }
          }
        );
      }


      // =========================================================
      // ESCAPE
      // =========================================================

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
/*
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



      var COUNTER_CENTER_LEFT = "50%";
      var COUNTER_CENTER_TOP = "42%";



      var COUNTER_SMALL_TOP = "8%";
      var COUNTER_SMALL_SCALE = 0.40;


      var SCALE_PRIMARY_TOP = "39%";
      var SCALE_SECONDARY_TOP = "52%";


      var LATE_TEXT_TOP = "22%";



      // =============================================
      // LIVE $32 / SECOND COUNTER
      // =============================================

var RATE_PER_SECOND = 32;
var pageOpenedAt = performance.now();

function updateCounter() {

  var elapsedSeconds =
    Math.floor(
      (performance.now() - pageOpenedAt) / 1000
    );

  var amount =
    elapsedSeconds * RATE_PER_SECOND;

  counterValue.textContent =
    "$" + amount.toLocaleString("en-US");

}

updateCounter();

setInterval(
  updateCounter,
  250
);

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
*/

document.addEventListener("DOMContentLoaded", function () {

  gsap.registerPlugin(ScrollTrigger);

  gsap.utils
    .toArray("[data-wash-scene]")
    .forEach(function (sec) {

      var q = gsap.utils.selector(sec);


      // =========================================================
      // ELEMENTS
      // =========================================================

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

      var counter =
        q("[data-wash-counter]")[0];

      var counterValue =
        q("[data-wash-counter-value]")[0];

      var counterLabel =
        q("[data-wash-counter-label]")[0];

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

        console.warn(
          "Washington section: missing required elements.",
          {
            track,
            intro,
            title,
            counter,
            counterValue,
            counterLabel,
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


      // =========================================================
      // SETTINGS
      // =========================================================

      var COUNTER_CENTER_LEFT = "50%";
      var COUNTER_CENTER_TOP = "42%";

      var COUNTER_SMALL_TOP = "8%";

      var COUNTER_SMALL_VALUE_SIZE = "4rem";

      // Stays 1rem in BOTH states.
      var COUNTER_LABEL_SIZE = "1.25rem";

      var SCALE_PRIMARY_TOP = "39%";
      var SCALE_SECONDARY_TOP = "52%";

      var LATE_TEXT_TOP = "22%";

      var RATE_PER_SECOND = 32;


      // =========================================================
      // LIVE COUNTER
      // =========================================================

      var pageOpenedAt =
        performance.now();


      function updateCounter() {

        var elapsedSeconds =
          Math.floor(
            (performance.now() - pageOpenedAt) / 1000
          );

        var amount =
          elapsedSeconds * RATE_PER_SECOND;

        counterValue.textContent =
          "$" + amount.toLocaleString("en-US");
      }


      updateCounter();

      var counterInterval =
        setInterval(
          updateCounter,
          100
        );


      // =========================================================
      // DESKTOP
      // =========================================================

      gsap.matchMedia().add(
        "(min-width: 992px)",
        function () {


          // =====================================================
          // TIMING
          // =====================================================

          var TEXT_FADE = 0.34;

          var INTRO_HOLD = 0.55;

          var COUNTER_IN = 0.55;
          var COUNTER_HOLD = 0.85;

          var VISUAL_IN = 0.75;
          var VISUAL_HOLD = 0.65;

          var SCALE_HOLD = 1.25;

          var QUESTION_HOLD = 0.80;

          var STAT_IN = 0.45;
          var STAT_HOLD = 0.90;

          var FINAL_HOLD = 1.40;


          // Large value size comes from Designer.
          var counterLargeValueSize =
            getComputedStyle(counterValue)
              .fontSize;


          // =====================================================
          // HELPERS
          // =====================================================

          function getComparisonLeft() {

            var scaleRect =
              scalePrimary
                .getBoundingClientRect();

            var counterParent =
              counter.offsetParent;


            if (!counterParent) {

              return (
                scaleRect.left +
                "px"
              );
            }


            var parentRect =
              counterParent
                .getBoundingClientRect();


            return (
              scaleRect.left -
              parentRect.left
            ) + "px";
          }


          // =====================================================
          // POSITIONING
          // =====================================================

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


          // =====================================================
          // INITIAL STATES
          // =====================================================

          gsap.set(
            title,
            {
              autoAlpha:
                0
            }
          );


          gsap.set(
            counter,
            {
              autoAlpha:
                0,

              left:
                COUNTER_CENTER_LEFT,

              top:
                COUNTER_CENTER_TOP,

              x:
                0,

              y:
                0,

              xPercent:
                -50,

              yPercent:
                -50
            }
          );


          gsap.set(
            counterValue,
            {
              fontSize:
                counterLargeValueSize
            }
          );


          // Always 1rem.
          gsap.set(
            counterLabel,
            {
              fontSize:
                COUNTER_LABEL_SIZE
            }
          );


          if (capitol) {

            gsap.set(
              capitol,
              {
                yPercent:
                  100,

                autoAlpha:
                  0
              }
            );
          }


          if (claude) {

            gsap.set(
              claude,
              {
                autoAlpha:
                  0,

                scale:
                  0.72,

                rotation:
                  -8
              }
            );
          }


          bills.forEach(
            function (bill, i) {

              var rotations =
                [-16, 13, -8];

              var xs =
                [-70, 45, 80];


              gsap.set(
                bill,
                {
                  autoAlpha:
                    0,

                  y:
                    "-40vh",

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


          if (scaleGroup) {

            gsap.set(
              scaleGroup,
              {
                autoAlpha:
                  1
              }
            );
          }


          gsap.set(
            scalePrimary,
            {
              autoAlpha:
                0,

              y:
                35
            }
          );


          gsap.set(
            scaleSecondary,
            {
              autoAlpha:
                0,

              y:
                35
            }
          );


          gsap.set(
            question,
            {
              autoAlpha:
                0
            }
          );


          gsap.set(
            [
              fellows,
              pac,
              pledged
            ],
            {
              autoAlpha:
                0,

              y:
                45
            }
          );


          // =====================================================
          // BILL FLOAT
          // =====================================================

          var floatTweens =
            [];


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

                    repeat:
                      -1,

                    yoyo:
                      true
                  }
                );


              floatTweens.push(
                tween
              );
            }
          );


          // =====================================================
          // MASTER TIMELINE
          // =====================================================

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


          // =====================================================
          // 01 — TITLE
          // =====================================================

          tl.to(
            title,
            {
              autoAlpha:
                1,

              duration:
                TEXT_FADE,

              ease:
                "power2.out"
            }
          );


          tl.to(
            {},
            {
              duration:
                INTRO_HOLD
            }
          );


          // =====================================================
          // 02 — INTRO OUT
          // =====================================================

          tl.to(
            intro,
            {
              autoAlpha:
                0,

              y:
                "-18vh",

              duration:
                0.50,

              ease:
                "power3.in"
            }
          );


          // =====================================================
          // 03 — COUNTER
          // =====================================================

          tl.to(
            counter,
            {
              autoAlpha:
                1,

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


          // =====================================================
          // 04 — CAPITOL + BILLS + CLAUDE
          // =====================================================

          if (capitol) {

            tl.to(
              capitol,
              {
                autoAlpha:
                  1,

                yPercent:
                  0,

                duration:
                  VISUAL_IN,

                ease:
                  "power3.out"
              }
            );
          }


          bills.forEach(
            function (bill, i) {

              tl.to(
                bill,
                {
                  autoAlpha:
                    1,

                  y:
                    0,

                  x:
                    0,

                  rotation:
                    0,

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


          if (claude) {

            tl.to(
              claude,
              {
                autoAlpha:
                  1,

                scale:
                  1,

                rotation:
                  0,

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


          // =====================================================
          // 05 — COUNTER TO COMPARISON
          // =====================================================

          tl.to(
            counter,
            {
              left:
                getComparisonLeft,

              top:
                COUNTER_SMALL_TOP,

              xPercent:
                0,

              yPercent:
                0,

              duration:
                0.72,

              ease:
                "power4.inOut"
            }
          );


          // Dollar amount changes actual font-size.
          tl.to(
            counterValue,
            {
              fontSize:
                COUNTER_SMALL_VALUE_SIZE,

              duration:
                0.72,

              ease:
                "power4.inOut"
            },

            "<"
          );


          // Explicitly remains 1rem.
          tl.to(
            counterLabel,
            {
              fontSize:
                COUNTER_LABEL_SIZE,

              duration:
                0.72,

              ease:
                "power4.inOut"
            },

            "<"
          );


          // =====================================================
          // $7.5B
          // =====================================================

          tl.to(
            scalePrimary,
            {
              autoAlpha:
                1,

              y:
                0,

              duration:
                0.55,

              ease:
                "power3.out"
            },

            "<0.25"
          );


          // =====================================================
          // $1B
          // =====================================================

          tl.to(
            scaleSecondary,
            {
              autoAlpha:
                1,

              y:
                0,

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


          tl.to(
            [
              scalePrimary,
              scaleSecondary
            ],
            {
              autoAlpha:
                0,

              y:
                -30,

              duration:
                0.35,

              ease:
                "power2.in"
            }
          );


          // =====================================================
          // 06 — QUESTION
          // =====================================================

          tl.to(
            question,
            {
              autoAlpha:
                1,

              duration:
                TEXT_FADE,

              ease:
                "power2.out"
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
            question,
            {
              autoAlpha:
                0,

              duration:
                0.28,

              ease:
                "power2.in"
            }
          );


          // =====================================================
          // 07 — FELLOWS
          // =====================================================

          tl.to(
            fellows,
            {
              autoAlpha:
                1,

              y:
                0,

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
              autoAlpha:
                0,

              y:
                -40,

              duration:
                0.35,

              ease:
                "power2.in"
            }
          );


          // =====================================================
          // 08 — PAC
          // =====================================================

          tl.to(
            pac,
            {
              autoAlpha:
                1,

              y:
                0,

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
              autoAlpha:
                0,

              y:
                -40,

              duration:
                0.35,

              ease:
                "power2.in"
            }
          );


          // =====================================================
          // 09 — PLEDGED
          // =====================================================

          tl.to(
            pledged,
            {
              autoAlpha:
                1,

              y:
                0,

              duration:
                0.60,

              ease:
                "power4.out"
            }
          );


          // =====================================================
          // FINAL
          // =====================================================

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


          if (claude) {

            tl.to(
              claude,
              {
                scale:
                  1.08,

                duration:
                  0.55,

                ease:
                  "power2.out"
              },

              "<"
            );
          }


          tl.to(
            {},
            {
              duration:
                FINAL_HOLD
            }
          );


          // =====================================================
          // CLEANUP
          // =====================================================

          return function () {

            floatTweens.forEach(
              function (tween) {

                tween.kill();
              }
            );
          };

        }
      );


      // =========================================================
      // PAGE CLEANUP
      // =========================================================

      window.addEventListener(
        "beforeunload",
        function () {

          clearInterval(
            counterInterval
          );
        }
      );

    });

});




document.addEventListener("DOMContentLoaded", function () {

  gsap.registerPlugin(ScrollTrigger);


  gsap.utils
    .toArray("[data-news-scene]")
    .forEach(function (sec) {

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


      // =====================================================
      // SECTION TITLE
      // =====================================================

      if (sectionTitle) {

        gsap.fromTo(
          sectionTitle,
          {
            autoAlpha: 0
          },
          {
            autoAlpha: 1,

            duration:
              MOTION.textFade.duration,

            ease:
              MOTION.textFade.ease,

            scrollTrigger: {
              trigger: sectionTitle,
              start: "top 85%",
              toggleActions:
                "play none none reverse"
            }
          }
        );
      }


      // =====================================================
      // NEWS GROUPS
      // =====================================================

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


        // Initial states

        gsap.set(
          title,
          {
            autoAlpha: 0
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


        // Entrance

        var tl =
          gsap.timeline({
            paused: true
          });


        tl.to(
          title,
          {
            autoAlpha: 1,

            duration:
              MOTION.textFade.duration,

            ease:
              MOTION.textFade.ease
          }
        );


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


        ScrollTrigger.create({
          trigger: group,

          start:
            "top 72%",

          onEnter:
            function () {
              tl.play();
            },

          onLeaveBack:
            function () {
              tl.reverse();
            }
        });

      });


      requestAnimationFrame(
        function () {
          ScrollTrigger.refresh();
        }
      );

    });

});


/*
<script>
  gsap.registerPlugin(ScrollTrigger);
  // GLOBAL MOTION SETTINGS

  const MOTION = {
    textFade: {
      duration: 0.22,
      ease: 'power2.out',
    },

    sceneFade: {
      duration: 1,
      ease: 'power2.out',
    },

    float: {
      x: [-8, 8],
      y: [-16, -28],
      rotate: [-3.2, 3.2],
      duration: [2.4, 3.6],
      ease: 'sine.inOut',
    },
  };

  // GLOBAL REUSABLE ANIMATIONS

  function fadeIn(target, motion = MOTION.textFade) {
    return gsap.to(target, {
      opacity: 1,
      duration: motion.duration,
      ease: motion.ease,
      overwrite: true,
    });
  }

  function fadeOut(target, motion = MOTION.textFade) {
    return gsap.to(target, {
      opacity: 0,
      duration: motion.duration,
      ease: motion.ease,
      overwrite: true,
    });
  }

  function createFloat(target, motion = MOTION.float, delay = 0) {
    const timeline = gsap.timeline({
      repeat: -1,
      yoyo: true,
      paused: true,
      defaults: {
        ease: motion.ease,
      },
    });

    timeline.to(
      target,
      {
        x: gsap.utils.random(motion.x[0], motion.x[1]),

        y: gsap.utils.random(motion.y[0], motion.y[1]),

        rotate: gsap.utils.random(motion.rotate[0], motion.rotate[1]),

        duration: gsap.utils.random(motion.duration[0], motion.duration[1]),
      },
      delay,
    );

    return timeline;
  }
  // Maduro initial block for scrolling to allow cinematic entrace
  /*
  const INTRO_DURATION = 10400; // has to match Webflow's classic animation

  document.body.dataset.maduroLock = 'true';

  setTimeout(() => {
    delete document.body.dataset.maduroLock;
  }, INTRO_DURATION);
*/
  // end of Maduro scroll blocking
/*
  // MADURO SECTION

  function initMaduroScroll() {
    const maduroTrack = document.querySelector('[data-maduro-track="true"]');

    const maduroVisual = document.querySelector('[data-maduro-visual="true"]');

    const maduroMessages = gsap.utils.toArray('[data-maduro-message]');

    const maduroPoints = [0.0, 0.15, 0.3, 0.45, 0.6, 0.85];

    if (!maduroTrack || !maduroVisual || !maduroMessages.length) return;

    let maduroActive = 0;

    maduroMessages.forEach((message, index) => {
      gsap.set(message.querySelectorAll('[data-fade]'), {
        opacity: index === 0 ? 1 : 0,
      });
    });

    function showMaduroMessage(index) {
      if (index === maduroActive) return;

      const oldMessage = maduroMessages[maduroActive];
      const newMessage = maduroMessages[index];

      fadeOut(oldMessage.querySelectorAll('[data-fade]'));

      fadeIn(newMessage.querySelectorAll('[data-fade]'));

      const maduroDate = newMessage.querySelector('[data-maduro-date]');
      const maduroShowDate = maduroDate?.dataset.maduroDate === 'true';

      if (maduroShowDate) {
        gsap.set('[data-maduro-date]', {
          opacity: 0,
          visibility: 'hidden',
        });

        gsap.set(maduroDate, {
          opacity: 1,
          visibility: 'visible',
        });
      } else {
        fadeOut('[data-maduro-date]');
      }

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

        maduroPoints.forEach((point, index) => {
          if (self.progress >= point) {
            maduroIndex = index;
          }
        });

        showMaduroMessage(maduroIndex);
      },
    });

    ScrollTrigger.refresh();
  }

  function startMaduroScroll() {
    const maduroTrack = document.querySelector('[data-maduro-track="true"]');

    if (!maduroTrack) return;

    const maduroStart = maduroTrack.getBoundingClientRect().top + window.scrollY;

    const originalScrollBehavior = document.documentElement.style.scrollBehavior;

    document.documentElement.style.scrollBehavior = 'auto';

    window.scrollTo(0, maduroStart);

    setTimeout(() => {
      window.scrollTo(0, maduroStart);

      initMaduroScroll();
      ScrollTrigger.refresh();

      document.documentElement.style.scrollBehavior = originalScrollBehavior;
    }, 180);
  }

  //setTimeout(startMaduroScroll, INTRO_DURATION + 20);
</script>
*/

function initMapSection() {

  gsap.registerPlugin(ScrollTrigger);

  var track =
    document.querySelector("[data-map-track]");

  var introText =
    document.querySelector("[data-map-intro-text]");

  var visualWrapper =
    document.querySelector("[data-map-visual-wrapper]");


  console.log("MAP INIT", {
    track,
    introText,
    visualWrapper
  });


  if (
    !track ||
    !introText ||
    !visualWrapper
  ) {

    console.warn(
      "Map section missing elements."
    );

    return;
  }


  gsap.matchMedia().add(
    "(min-width: 992px)",
    function () {

      gsap.set(
        visualWrapper,
        {
          autoAlpha: 0
        }
      );


      var mapTimeline =
        gsap.timeline({
          scrollTrigger: {
            trigger: track,
            start: "top top",
            end: "bottom bottom",
            scrub: 0.55,
          }
        });


      mapTimeline.to(
        introText,
        {
          autoAlpha: 0,
          duration: 0.45,
          ease: "power2.in"
        }
      );


      mapTimeline.to(
        visualWrapper,
        {
          autoAlpha: 1,
          duration: 0.55,
          ease: "power2.out"
        }
      );

    }
  );


  ScrollTrigger.refresh();

}


if (document.readyState === "loading") {

  document.addEventListener(
    "DOMContentLoaded",
    initMapSection
  );

} else {

  initMapSection();

}

  function initMapLens() {

  var wrapper =
    document.querySelector(
      "[data-map-visual-wrapper]"
    );

  var visual =
    document.querySelector(
      "[data-map-visual]"
    );

  var image =
    visual
      ? visual.querySelector("img")
      : null;


  if (
    !wrapper ||
    !visual ||
    !image
  ) {

    console.warn(
      "Map lens missing elements.",
      {
        wrapper: !!wrapper,
        visual: !!visual,
        image: !!image
      }
    );

    return;
  }


  var ZOOM = 1.5;

  var LENS_SIZE =
    180;


  var lens =
    document.createElement("div");

  lens.className =
    "map-lens";

  wrapper.appendChild(
    lens
  );


  function updateSource() {

    var src =
      image.currentSrc ||
      image.src;

    if (!src) {
      return;
    }

    lens.style.backgroundImage =
      'url("' + src + '")';
  }


  updateSource();


  if (!image.complete) {

    image.addEventListener(
      "load",
      updateSource
    );
  }


  wrapper.addEventListener(
    "mousemove",
    function (event) {

      var imageRect =
        image.getBoundingClientRect();

      var wrapperRect =
        wrapper.getBoundingClientRect();


      // Only activate while mouse is over actual image.

      if (
        event.clientX < imageRect.left ||
        event.clientX > imageRect.right ||
        event.clientY < imageRect.top ||
        event.clientY > imageRect.bottom
      ) {

        lens.classList.remove(
          "is-visible"
        );

        return;
      }


      var imageX =
        event.clientX -
        imageRect.left;

      var imageY =
        event.clientY -
        imageRect.top;


      // Lens position.

      var lensX =
        event.clientX -
        wrapperRect.left -
        LENS_SIZE / 2;

      var lensY =
        event.clientY -
        wrapperRect.top -
        LENS_SIZE / 2;


      lens.style.left =
        lensX + "px";

      lens.style.top =
        lensY + "px";


      // Enlarged copy of image.

      lens.style.backgroundSize =
        (
          imageRect.width *
          ZOOM
        ) +
        "px " +
        (
          imageRect.height *
          ZOOM
        ) +
        "px";


      // Place hovered coordinate in center of lens.

      lens.style.backgroundPosition =
        (
          LENS_SIZE / 2 -
          imageX * ZOOM
        ) +
        "px " +
        (
          LENS_SIZE / 2 -
          imageY * ZOOM
        ) +
        "px";


      lens.classList.add(
        "is-visible"
      );

    }
  );


  wrapper.addEventListener(
    "mouseleave",
    function () {

      lens.classList.remove(
        "is-visible"
      );

    }
  );

}


if (document.readyState === "loading") {

  document.addEventListener(
    "DOMContentLoaded",
    initMapLens
  );

} else {

  initMapLens();

}
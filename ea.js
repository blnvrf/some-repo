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


// ── LIBERTY ─────────────────────────────────────────────
// Designer:
//   liberty_track     height 200vh
//   liberty_persist   sticky, top 0, height 100svh,
//                     margin-bottom -100svh, z-index 20
//   opacity 0 handled in JS for: bg-lyr is-dark,
//   statue-lyr is-dark, bits-lyr, fx, both figures,
//   both word is-in

document.addEventListener("DOMContentLoaded", function () {
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

  var scenes = gsap.utils.toArray("[data-liberty-scene]");
  if (!scenes.length) return;

  gsap.registerPlugin(ScrollTrigger);

  window.addEventListener("load", function () {
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
    bg: PRE + 0.50,
    statueDark: PRE + 0.55,
    swap: PRE + 0.62,
    statueLight: PRE + 0.70,
    bits: PRE + 1,
    specks: PRE + 0.75,
    figures: PRE + 1.55,
    hold: PRE + 1.12,
    statueSwap: PRE + 1.1
  };

  // ══ HOW LONG THINGS TAKE ═════════════════════════════════
  var DUR = {
    bg: 0.60,
    statueDark: 0.60,
    swap: 0.50,
    statueLight: 0.1, // short: it only has to vanish behind
                       // the dark one, which is already there
    bits: 0.750,
    specks: 0.40,
    figures: 0.75,
    hold: 3         // the pause. raise this AND the track
                       // height together, or it just speeds up
  };

  // ══ EVERYTHING ELSE ══════════════════════════════════════
  var CFG = {
    scrub: 0.4,          // lag between scroll and animation
    bandColor: "#080331",
    figureStagger: 0.08, // second figure starts this much later

    speckCount: 50,
    speckColor: "#d85a30",
    speckStart: 0.35,    // fraction of track height where the
                         // flicker switches on
floatX: [-8, 8],    // px range of the figure drift
    floatY: [-16, -28],  // px range of the figure drift
    floatRot: [-3.2, 3.2],
    floatDur: [2.4, 3.6] // seconds. randomised per figure so
                         // they never sync up
  };

  var mm = gsap.matchMedia();

  scenes.forEach(function (scene) {
    var q = gsap.utils.selector(scene);

    mm.add(
      {
        isDesktop: "(min-width: 992px)",
        motionOk: "(prefers-reduced-motion: no-preference)"
      },
      function (context) {
        if (!context.conditions.isDesktop) return;
        var motionOk = context.conditions.motionOk;

        var track = q("[data-liberty-track]")[0];
        var bgDark = q('[data-liberty="bg-dark"]');
        var band = q('[data-liberty="band"]');
        var statueLight = q('[data-liberty="light"]');
        var statueDark = q('[data-liberty="dark"]');
        var bits = q('[data-liberty="bits"]');
        var swaps = q("[data-liberty-swap]");
        var figures = q("[data-figure]");
        var host = q("[data-liberty-static]")[0];

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
            var sp = document.createElement("span");
            sp.style.cssText =
              "position:absolute;display:block;background:" +
              CFG.speckColor + ";opacity:0;will-change:opacity";
            host.appendChild(sp);

            (function (el) {
              function place() {
                var d = gsap.utils.random(2, 4, 1);
                gsap.set(el, {
                  width: d,
                  height: d,
                  left: gsap.utils.random(0, 100) + "%",
                  top: gsap.utils.random(0, 100) + "%"
                });
              }

              place();

              // repeatRefresh re-rolls the delay every cycle
              // and onRepeat moves the speck, so the pattern
              // never visibly loops
              flick.to(el, {
                opacity: 1,
                duration: 0.06,
                repeat: -1,
                repeatRefresh: true,
                repeatDelay: gsap.utils.random(0.4, 5),
                yoyo: true,
                onRepeat: place
              }, gsap.utils.random(0, 3));
            })(sp);
          }

          loops.push(flick);

          // switch the flicker on partway down the track and
          // off again when the section leaves, so it is not
          // burning frames through the rest of the page
          ScrollTrigger.create({
            trigger: track,
            start: "top top-=" +
              Math.round(track.offsetHeight * CFG.speckStart),
            end: "bottom bottom",
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

        // ══ 2. THE MASTER TIMELINE ═════════════════════════
        // scrubbed: its playhead is tied to scroll position
        // rather than to time.
        var tl = gsap.timeline({
          scrollTrigger: {
            trigger: track,
            start: "top top",
            end: "bottom bottom",
            scrub: CFG.scrub
          }
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

          tl.to(out, {
            yPercent: -110,
            opacity: 0,
            duration: DUR.swap,
            ease: "power2.inOut"
          }, BEATS.swap);

          tl.to(inn, {
            yPercent: 0,
            opacity: 1,
            duration: DUR.swap,
            ease: "power2.inOut"
          }, BEATS.swap);
        });

        // ── the background turns ──────────────────────────
        tl.to(bgDark, {
          opacity: 1,
          duration: DUR.bg,
          ease: "none"
        }, BEATS.bg);

        // the band is not fading, its colour is tweening.
        // it has mix-blend-mode multiply, so through the
        // transition it multiplies with whatever is behind it.
        tl.to(band, {
          backgroundColor: CFG.bandColor,
          duration: DUR.bg,
          ease: "none"
        }, BEATS.bg);

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
          opacity: 0
        });

        tl.to(bits, {
          yPercent: 0,
          opacity: 1,
          duration: DUR.bits,
          ease: "power3.out"
        }, BEATS.bits);


        if (host) {
          tl.to(host, {
            opacity: 1,
            duration: DUR.specks,
            ease: "none"
          }, BEATS.specks);
        }



figures.forEach(function (fig, i) {

  var side = fig.getAttribute("data-figure");

  tl.fromTo(
    fig,
    {
      x: side === "left"
        ? -window.innerWidth
        : window.innerWidth,

      y: side === "left" ? 120 : 175,

      opacity: 0
    },
    {
      x: 0,
      y: 0,
      opacity: 1,
      duration: DUR.figures,
      ease: "power2.out"
    },

    BEATS.figures + i * CFG.figureStagger
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
              defaults: { ease: "sine.inOut" }
            });

var floatTarget = fig.querySelector(
  '[data-inner-figure="true"]'
);

f.to(floatTarget, {
  x: gsap.utils.random(CFG.floatX[0], CFG.floatX[1]),
  y: gsap.utils.random(CFG.floatY[0], CFG.floatY[1]),
  rotate: gsap.utils.random(CFG.floatRot[0], CFG.floatRot[1]),
  duration: gsap.utils.random(CFG.floatDur[0], CFG.floatDur[1])
}, i * 0.4);

          var bars = q("[data-blind-bar]");

        gsap.set(bars, { scaleY: 0, transformOrigin: "bottom center" });

        tl.to(bars, {
          scaleY: 1,
          duration: 0.30,
          ease: "power2.inOut",
          stagger: 0.05
        }, BEATS.hold + DUR.hold - 0.5);

            loops.push(f);

            ScrollTrigger.create({
              trigger: track,
              start: "top bottom",
              end: "bottom top",
              onToggle: function (self) {
                self.isActive ? f.play() : f.pause();
              }
            });
          });
        }

        // ══ CLEANUP ════════════════════════════════════════
        // runs when the viewport drops below 992px. kills the
        // looping timelines and empties the injected specks
        // so a resize back up does not stack duplicates.
        return function () {
          loops.forEach(function (t) { t.kill(); });
          if (host) host.innerHTML = "";
        };
      }
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

document.addEventListener("DOMContentLoaded", function () {
  gsap.utils.toArray("[data-pig]").forEach(function (sec) {
    var pq = gsap.utils.selector(sec);

    var track = pq("[data-pig-track]")[0];
    var stack = pq("[data-pig-stack]")[0];
    var lines = pq("[data-pig-line]");
    var human = pq("[data-pig-human]");
    var op = pq("[data-pig-op]");
    var pigSide = pq("[data-pig-pigside]");
    var herdBox = pq("[data-pig-herd]")[0];
    var pigCount = pq('[data-pig-count="pig"]')[0];
    var quote = pq("[data-pig-quote]");

    if (!track || !lines.length || !herdBox) return;

    var seed = herdBox.querySelector("img");
    if (!seed) return;

    // ── one entry per copy line, in order ─────────────────
    // pigs 0 for the first five, so the copy stays centred
    // through the whole setup and only drops at line 6
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
      { pigs: 10, human: true  },  // 10  it's logical
      { pigs: 10, human: true  }   // 11  spare
    ];

    // ── how long each line holds, in timeline units ───────
    // one entry per line. the opening statement gets three
    // times the rest. add or remove entries to match BEATS.
    var HOLDS = [
      1.00,   //  1  the opening statement, sits a long time
      0.34,   //  2
      0.40,   //  3
      0.40,   //  4
      0.44,   //  5  the question, slightly longer
      0.34,   //  6
      0.46,   //  7  the 0.51 math, longest of the rest
      0.34,   //  8
      0.40,   //  9
      0.40,   // 10
      0.40    // 11
    ];

    // ── config ────────────────────────────────────────────
    var FADE = 0.14;         // text fade duration
    var FIG = 0.16;          // figure fade duration
    var DROP = 0.34;         // how long the copy takes to move
    var TEXT_LOW = "34vh";   // how far the copy drops

    // ── build the herd to 10 total ────────────────────────
    var HERD_TARGET = 10;
    var existing = herdBox.querySelectorAll("img").length;

    for (var p = existing; p < HERD_TARGET; p++) {
      var clone = seed.cloneNode(true);
      clone.classList.add("is-stack");
      herdBox.appendChild(clone);
    }

    var herd = gsap.utils.toArray(herdBox.querySelectorAll("img"));

    gsap.matchMedia().add("(min-width: 992px)", function () {
      // ── starting states ─────────────────────────────────
      gsap.set([human, op, pigSide, quote], { opacity: 0 });
      gsap.set(herd, { opacity: 0, display: "none" });
      if (stack) gsap.set(stack, { y: 0 });

      // grid locked to its ten-pig arrangement, never reflows.
      // 18% plus the 2% gap gives five per row, so ten wrap
      // as two rows of five and centre as a block.
      gsap.set(herdBox, { flexWrap: "wrap" });
      gsap.set(herd, { width: "18%", height: "auto" });

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
        var span = HOLDS[i] !== undefined ? HOLDS[i] : 0.34;
        var txt = line.querySelector("[data-pig-txt]");
        var beat = BEATS[i] || BEATS[BEATS.length - 1];
        var prev = i > 0 ? BEATS[i - 1] : { pigs: 0, human: false };
        var last = i === lines.length - 1;

        // ── copy: out before the next comes in ───────────
        if (txt) {
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

        // ── the copy drops once, as the figures arrive ───
        if (stack && beat.pigs > 0 && prev.pigs === 0) {
          tl.to(stack, {
            y: TEXT_LOW,
            duration: DROP,
            ease: "power2.inOut"
          }, at);
        }

        // ── figures: absolute state at every beat ────────
        tl.to(human, {
          opacity: beat.human ? 1 : 0,
          duration: FIG, ease: "none"
        }, at);

        tl.to(op, {
          opacity: beat.human && beat.pigs > 0 ? 1 : 0,
          duration: FIG, ease: "none"
        }, at);

        tl.to(pigSide, {
          opacity: beat.pigs > 0 ? 1 : 0,
          duration: FIG, ease: "none"
        }, at);

        herd.forEach(function (pig, idx) {
          tl.set(pig, {
            display: idx < beat.pigs ? "block" : "none"
          }, at);

          tl.to(pig, {
            opacity: idx < beat.pigs ? 1 : 0,
            duration: FIG, ease: "none"
          }, at + idx * 0.01);
        });

        if (pigCount) {
          tl.to(pigCount, {
            duration: FIG,
            snap: { innerText: 1 },
            innerText: beat.pigs,
            ease: "none"
          }, at);
        }

        // ── torn quote on the final beat ─────────────────
        if (last && quote.length) {
          tl.fromTo(quote,
            { opacity: 0, y: 60, rotate: -8 },
            {
              opacity: 1, y: 0, rotate: -2,
              duration: 0.26, ease: "power3.out"
            },
            at
          );
        }

        at += span;
      });
    });
  });
});

// ── IDEOLOGY ────────────────────────────────────────────
// Designer:
//   ideo_track   height 400vh
//   ideo_title   position absolute, top 50%, left 0, width 100%,
//                text-align center, line-height 1.05,
//                white-space nowrap, NO transform
//   ideo_body    position absolute, top 50%, left 50%,
//                max-width 46ch, transform translate -50% -50%
//   ideo_quote   position absolute, top 50%, left 50%, width 58%,
//                transform translate -50% -50%, z-index 2
//                sits outside padding-global so it centres on
//                the viewport rather than the container
//   Needs SplitText ticked in Integrations.

document.addEventListener("DOMContentLoaded", function () {
  gsap.utils.toArray("[data-ideology]").forEach(function (sec) {
    var iq = gsap.utils.selector(sec);

    var track = iq("[data-ideology-track]")[0];
    var title = iq("[data-ideo-title]");
    var body = iq("[data-ideo-body]");
    var quote = iq("[data-ideo-quote]");

    if (!track || !title.length) return;

    gsap.matchMedia().add("(min-width: 992px)", function () {
      var hasSplit = typeof SplitText !== "undefined";
      if (hasSplit) gsap.registerPlugin(SplitText);

      var tSplit = hasSplit ? new SplitText(title, { type: "words" }) : null;
      var bSplit = hasSplit ? new SplitText(body, { type: "words" }) : null;

      var titleWords = tSplit ? tSplit.words : title;
      var bodyWords = bSplit ? bSplit.words : body;

      // title is centred by yPercent, not by a CSS transform,
      // so GSAP can move it to the top edge without a fight
      gsap.set(title, { yPercent: -50 });
      gsap.set(titleWords, { opacity: 0, yPercent: 60 });
      gsap.set(bodyWords, { opacity: 0, yPercent: 60 });
      gsap.set(quote, { opacity: 0, yPercent: 90, rotate: -6 });

      var tl = gsap.timeline({
        scrollTrigger: {
          trigger: track,
          start: "top top",
          end: "bottom bottom",
          scrub: 0.4
        }
      });

      tl.to(titleWords, {
        opacity: 1, yPercent: 0,
        duration: 0.14, ease: "power2.out",
        stagger: { each: 0.02 }
      }, 0);

      // title holds alone from 0.16 to 0.50

      tl.to(title, {
        top: "1rem", yPercent: 0,
        duration: 0.2, ease: "power2.inOut"
      }, 0.50);

      tl.to(bodyWords, {
        opacity: 1, yPercent: 0,
        duration: 0.14, ease: "power2.out",
        stagger: { each: 0.015 }
      }, 0.54);

      tl.to(bodyWords, {
        opacity: 0, yPercent: -60,
        duration: 0.14, ease: "power2.in",
        stagger: { each: 0.012 }
      }, 0.96);

      tl.to(quote, {
        opacity: 1, yPercent: 0, rotate: -1.5,
        duration: 0.22, ease: "power3.out"
      }, 1.00);

      // dead space after 1.02 so 45 words can be read.
      // lengthen ideo_track rather than editing numbers.

      return function () {
        if (tSplit) tSplit.revert();
        if (bSplit) bSplit.revert();
      };
    });
  });
});


// ── NUKE ────────────────────────────────────────────────
// Designer:
//   nuke_track   height 600vh
//   nuke_bg      data-nuke texture, absolute, inset 0, z-index 0
//   nuke_blast   data-nuke blast, absolute, bottom 0, left 50%,
//                width 62%, z-index 1, NO transform
//   nuke_land    data-nuke land, absolute, bottom 0, left 0,
//                width 100%, z-index 2
//   nuke_bits    data-nuke bits, absolute, top 0, left 50%,
//                width 40%, z-index 3, NO transform
//   nuke_slide   absolute, top 50%, left 0, right 0, NO transform
//   blast and land must share the same horizon in their exports

document.addEventListener("DOMContentLoaded", function () {
  gsap.utils.toArray("[data-nuke-scene]").forEach(function (sec) {
    var nq = gsap.utils.selector(sec);

    var track = nq("[data-nuke-track]")[0];
    var texture = nq('[data-nuke="texture"]');
    var land = nq('[data-nuke="land"]');
    var blast = nq('[data-nuke="blast"]');
    var bits = nq('[data-nuke="bits"]');
    var title = nq("[data-nuke-title]");
    var slides = nq("[data-nuke-slide]");

    if (!track) return;

    var STEP = 0.22;

    gsap.matchMedia().add("(min-width: 992px)", function () {
      // xPercent handles the left 50% centring so nothing
      // in CSS fights GSAP for the transform
      gsap.set(texture, { opacity: 0 });
      gsap.set(land, { opacity: 0, yPercent: 60 });
      gsap.set(blast, { opacity: 0, yPercent: 70, xPercent: -50 });
      gsap.set(bits, { opacity: 0, yPercent: -60, xPercent: -50 });
      gsap.set(title, { opacity: 0, y: 24 });
      gsap.set(slides, { opacity: 0, yPercent: -50 });

      var tl = gsap.timeline({
        scrollTrigger: {
          trigger: track,
          start: "top top",
          end: "bottom bottom",
          scrub: 0.4
        }
      });

      tl.to(texture, { opacity: 1, duration: 0.14, ease: "none" }, 0);

      tl.to(land, {
        opacity: 1, yPercent: 0,
        duration: 0.20, ease: "power2.out"
      }, 0.08);

      tl.to(blast, {
        opacity: 1, yPercent: 0,
        duration: 0.26, ease: "power2.out"
      }, 0.20);

      tl.to(bits, {
        opacity: 1, yPercent: 0,
        duration: 0.22, ease: "power2.out"
      }, 0.34);

      tl.to(title, {
        opacity: 1, y: 0,
        duration: 0.16, ease: "power2.out"
      }, 0.44);

      slides.forEach(function (slide, i) {
        var at = 0.56 + i * STEP;
        var last = i === slides.length - 1;

        tl.to(slide, {
          opacity: 1, duration: 0.12, ease: "power1.out"
        }, at);

        if (!last) {
          tl.to(slide, {
            opacity: 0, duration: 0.12, ease: "power1.in"
          }, at + STEP);
        }
      });
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
  gsap.utils.toArray("[data-math-scene]").forEach(function (sec) {
    var mq = gsap.utils.selector(sec);

    var track = mq("[data-math-track]")[0];
    var items = mq("[data-math-item]");
    var field = mq("[data-math-field]");
    var fieldAll = mq('[data-math-field="all"]');
    var fieldLit = mq('[data-math-field="lit"]');
    var caption = mq("[data-math-caption]")[0];
    var capHead = mq("[data-math-head]")[0];
    var capSub = mq("[data-math-sub]")[0];
    var burst = mq("[data-math-burst]");
    var end = mq("[data-math-end]");

    if (!track || !items.length) return;

    // ── how long each stack item holds ────────────────────
    // one entry per data-math-item, in order:
    // title, copy, quote
    var HOLDS = [0.70, 0.80, 0.90];

    // ── config ────────────────────────────────────────────
    var IN = 0.20;        // how long an item takes to rise in
    var OUT = 0.18;       // how long it takes to lift away
    var RISE = 60;        // px travelled on the way in
    var LIFT = -70;       // px travelled on the way out
    var GAP = 0.30;       // empty frame after the last item
    var BURST = 420;      // scale for a 6px dot to cover 1440px
    var CAP_TOP = "0vh";  // flush to the top edge, no gap
    var FIELD_REST = 0;   // field lands flush
    var XFADE = 0.40;     // dot image cross-fade

    var CAPTION_1 = "People who do not exist yet";
    var SUB_1 = "10^58 potential future lives";
    var CAPTION_2 = "8,000,000,000";
    var SUB_2 = "Everyone alive today";

    gsap.matchMedia().add("(min-width: 992px)", function () {
      // ── starting states ─────────────────────────────────
      // xPercent and yPercent do the centring so GSAP can
      // move the items without a CSS transform fighting it
      gsap.set(items, {
        opacity: 0,
        xPercent: -50,
        yPercent: -50,
        y: RISE
      });
      gsap.set(field, { opacity: 0, yPercent: 100 });
      gsap.set(fieldAll, { opacity: 1 });
      gsap.set(fieldLit, { opacity: 0 });
      gsap.set(caption, { opacity: 0, yPercent: -50 });
      gsap.set(burst, { opacity: 0, scale: 1, xPercent: -50, yPercent: -50 });
      gsap.set(end, { opacity: 0 });

      var tl = gsap.timeline({
        scrollTrigger: {
          trigger: track,
          start: "top top",
          end: "bottom bottom",
          scrub: 0.4
        }
      });

      // ── 1-3. one item at a time, rise then lift ─────────
      // positions accumulate so each item can have its own
      // length. it rises into place, holds, then lifts away
      // in the same direction, so the sequence reads as one
      // continuous upward flow.
      var at = 0;

      items.forEach(function (item, i) {
        var span = HOLDS[i] !== undefined ? HOLDS[i] : 0.70;

        tl.to(item, {
          opacity: 1,
          y: 0,
          duration: IN,
          ease: "power3.out"
        }, at);

        tl.to(item, {
          opacity: 0,
          y: LIFT,
          duration: OUT,
          ease: "power2.in"
        }, at + span - OUT);

        at += span;
      });

      // gap: empty frame

      // ── 4. caption 1 arrives in the centre ──────────────
      var capAt = at + GAP;

      tl.set(capHead, { innerText: CAPTION_1 }, capAt - 0.01);
      tl.set(capSub, { innerText: SUB_1 }, capAt - 0.01);

      tl.to(caption, {
        opacity: 1, duration: 0.18, ease: "power2.out"
      }, capAt);

      // gap: caption sits alone, centred

      // ── 5. the field rises and pushes the caption up ────
      // both move on the same ease and overlap in time, so it
      // reads as contact even though they never touch
      
      var fieldAt = capAt + 0.40;

      tl.to(field, {
        opacity: 1, yPercent: FIELD_REST,
        duration: 0.38, ease: "power2.out"
      }, fieldAt);

      tl.to(caption, {
        top: CAP_TOP, yPercent: 0,
        duration: 0.34, ease: "power2.out"
      }, fieldAt + 0.06);

      // gap: the full field holds

      // ── 6. slow cross-fade, instant text swap ───────────
      var litAt = fieldAt + 2.4;

      tl.to(fieldLit, { opacity: 1, duration: XFADE, ease: "none" }, litAt);
      tl.to(fieldAll, { opacity: 0, duration: XFADE, ease: "none" }, litAt + 2.4);

      // swaps in one frame at 80% through the cross-fade, so
      // the caption bar never leaves the screen
      tl.set(capHead, { innerText: CAPTION_2 }, litAt + XFADE * 0.8);
      tl.set(capSub, { innerText: SUB_2 }, litAt + XFADE * 0.8);

      // gap: the lit field holds

      // ── 7. the dot expands and takes the screen ─────────
      var burstAt = litAt + 1.30;

      tl.to(burst, { opacity: 1, duration: 0.06 }, burstAt);

      tl.to(burst, {
        scale: BURST, duration: 0.36, ease: "power2.in"
      }, burstAt + 0.04);

      tl.to([field, caption], { opacity: 0, duration: 0.14 }, burstAt + 0.24);

      tl.to(end, {
        opacity: 1, duration: 0.18, ease: "power1.out"
      }, burstAt + 0.44);
    });
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
  gsap.utils.toArray("[data-opt-scene]").forEach(function (sec) {
    var oq = gsap.utils.selector(sec);

    var track = oq("[data-opt-track]")[0];
    var sticky = track ? track.firstElementChild : null;
    var intro = oq("[data-opt-intro]");
    var blocks = oq("[data-opt-block]");

    if (!track || !sticky || !blocks.length) return;

    // ── config ────────────────────────────────────────────
    var INTRO_BG = "#ecefde";   // the cream the section opens on

    var BEAT = 1.08;            // scroll distance per block
    var INTRO_OUT = 0.34;       // when the intro title leaves
    var FIRST = 0.72;           // when block 1's head fades in
    var SLAP = 0.46;            // when the quote lands, per block
    var THROW = 0.64;           // when the block is thrown, per block

    gsap.matchMedia().add("(min-width: 992px)", function () {
      // ── starting states ─────────────────────────────────
      // blocks sit in place at full size. only their contents
      // animate in. the block itself moves only on the throw.
      gsap.set(sticky, { backgroundColor: INTRO_BG });
      gsap.set(intro, { opacity: 1, y: 0 });
      gsap.set(blocks, { opacity: 0, x: 0, y: 0, rotate: 0, scale: 1 });

      blocks.forEach(function (b) {
        gsap.set(b.querySelector("[data-opt-head]"), { opacity: 0, y: 30 });
        gsap.set(b.querySelector("[data-opt-copy]"), { opacity: 0, y: 30 });
        gsap.set(b.querySelector("[data-opt-quote]"), { opacity: 0 });
      });

      var tl = gsap.timeline({
        scrollTrigger: {
          trigger: track,
          start: "top top",
          end: "bottom bottom",
          scrub: 0.4
        }
      });

      // ── intro title holds, then clears ──────────────────
      tl.to(intro, {
        opacity: 0, y: -60,
        duration: 0.16, ease: "power2.in"
      }, INTRO_OUT);

      // ── the four blocks, identical pattern each ─────────
      blocks.forEach(function (block, i) {
        var at = FIRST + i * BEAT;

        var head = block.querySelector("[data-opt-head]");
        var copy = block.querySelector("[data-opt-copy]");
        var quote = block.querySelector("[data-opt-quote]");
        var bg = block.getAttribute("data-opt-bg") || INTRO_BG;
        var last = i === blocks.length - 1;

        // ── background turns while the frame is empty ─────
        // block 1: after the intro leaves
        // blocks 2-4: after the previous block has gone
        tl.to(sticky, {
          backgroundColor: bg,
          duration: 0.18, ease: "none"
        }, at - 0.20);

        tl.set(block, { opacity: 1 }, at - 0.02);

        // ── head and copy arrive fast ────────────────────
        tl.to(head, {
          opacity: 1, y: 0,
          duration: 0.10, ease: "power2.out"
        }, at);

        tl.to(copy, {
          opacity: 1, y: 0,
          duration: 0.10, ease: "power2.out"
        }, at + 0.02);

        // gap: a third of the beat to read it

        // ── the slap ──────────────────────────────────────
        // fast, oversized, off-angle, hard stop. anything
        // slower than 0.07 reads as arriving, not landing.
        tl.fromTo(quote,
          { opacity: 0, scale: 1.45, rotate: -14, y: -40 },
          {
            opacity: 1, scale: 1, rotate: -2, y: 0,
            duration: 0.07, ease: "power4.out"
          },
          at + SLAP
        );

        // the head stays put and rides the throw with
        // everything else rather than fading on impact

        // gap: sit with the quote on the copy

        // ── the throw ─────────────────────────────────────
        // head, copy and quote leave together as one object,
        // tilted left. gone before the next colour turn.
        if (!last) {
          tl.to(block, {
            y: "-125vh", rotate: -14, scale: 0.9,
            duration: 0.20, ease: "power2.in"
          }, at + THROW);

          tl.set(block, { opacity: 0 }, at + THROW + 0.22);
        }
      });

      // the final block holds to the end of the track.
      // raise opt_track above 1200vh to lengthen the holds.
    });
  });
});

// ── FTX ─────────────────────────────────────────────────
// Six blocks, same component shape as the optimized world.
// The portrait fades in at block 2 and holds behind
// everything to the end, with a very slow push-in.
//
// Designer: ftx_track height 1000vh.
// Money figures carry data-ftx-count, data-ftx-prefix and
// data-ftx-suffix. Counted in short form: nobody reads
// 4,238,109,442 ticking past, but 0 to 8 with a B lands.
// Check after duplicating a block:
//   document.querySelectorAll("[data-ftx-block]").forEach(
//     function(b,i){ console.log(i,
//       b.querySelectorAll("[data-ftx-item]").length); });
//   Want 2, 2, 5, 1, 5, 1.

document.addEventListener("DOMContentLoaded", function () {
  gsap.utils.toArray("[data-ftx-scene]").forEach(function (sec) {
    var fq = gsap.utils.selector(sec);

    var track = fq("[data-ftx-track]")[0];
    var portrait = fq("[data-ftx-portrait]");
    var blocks = fq("[data-ftx-block]");

    if (!track || !blocks.length) return;

    var BEAT = 1.08;
    var FIRST = 0.30;
    var STAGGER = 0.05;
    var COUNT_AT = 0.08;
    var THROW = 0.64;
    var PORTRAIT_ON = 1;

    gsap.matchMedia().add("(min-width: 992px)", function () {
      gsap.set(blocks, { opacity: 0, x: 0, y: 0, rotate: 0, scale: 1 });
      gsap.set(portrait, { opacity: 0, scale: 1.08 });

      blocks.forEach(function (b) {
        gsap.set(b.querySelectorAll("[data-ftx-item]"), {
          opacity: 0, y: 30
        });
      });

      var figs = fq("[data-ftx-count]");
      figs.forEach(function (f) {
        f._pre = f.getAttribute("data-ftx-prefix") || "";
        f._suf = f.getAttribute("data-ftx-suffix") || "";
        f._end = parseFloat(f.getAttribute("data-ftx-count")) || 0;
        f.textContent = f._pre + "0" + f._suf;
      });

      var tl = gsap.timeline({
        scrollTrigger: {
          trigger: track,
          start: "top top",
          end: "bottom bottom",
          scrub: 0.4
        }
      });

      blocks.forEach(function (block, i) {
        var at = FIRST + i * BEAT;

        var items = block.querySelectorAll("[data-ftx-item]");
        var blockFigs = block.querySelectorAll("[data-ftx-count]");
        var last = i === blocks.length - 1;

        if (i === PORTRAIT_ON && portrait.length) {
          tl.to(portrait, {
            opacity: 1, duration: 0.26, ease: "none"
          }, at - 0.18);

          // very slow push-in across the rest of the section.
          // imperceptible frame to frame, stops six screens
          // of static wallpaper.
          tl.to(portrait, {
            scale: 1,
            duration: (blocks.length - i) * BEAT,
            ease: "none"
          }, at);
        }

        tl.set(block, { opacity: 1 }, at - 0.02);

        items.forEach(function (item, n) {
          tl.to(item, {
            opacity: 1, y: 0,
            duration: 0.14, ease: "power2.out"
          }, at + n * STAGGER);
        });

        blockFigs.forEach(function (f, n) {
          var proxy = { v: 0 };

          tl.to(proxy, {
            v: f._end,
            duration: 0.44,
            ease: "power2.out",
            onUpdate: function () {
              f.textContent = f._pre + Math.round(proxy.v) + f._suf;
            }
          }, at + COUNT_AT + n * STAGGER);
        });

        if (!last) {
          tl.to(block, {
            y: "-125vh", rotate: -14, scale: 0.9,
            duration: 0.20, ease: "power2.in"
          }, at + THROW);

          tl.set(block, { opacity: 0 }, at + THROW + 0.22);
        }
      });
    });
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
  gsap.utils.toArray("[data-fam-scene]").forEach(function (sec) {
    var mq = gsap.utils.selector(sec);

    var track = mq("[data-fam-track]")[0];
    var sticky = track ? track.firstElementChild : null;
    var rail = mq("[data-fam-rail]")[0];
    var items = mq("[data-fam-item]");
    var cards = mq("[data-fam-card]");

    if (!track || !sticky || !rail || !cards.length) return;

    var HEAD_IN = 0.06;
    var RAIL_FROM = 0.18;
    var FOCUS = 1.0;
    var REST = 0.82;
    var DIM = 0.45;

    gsap.matchMedia().add("(min-width: 992px)", function () {
      gsap.set(items, { opacity: 0, y: 24 });
      gsap.set(cards, { scale: REST, opacity: DIM });
      gsap.set(mq("[data-fam-role]"), { opacity: 0 });
      gsap.set(rail, { x: 0 });

      var tl = gsap.timeline({
        scrollTrigger: {
          trigger: track,
          start: "top top",
          end: "bottom bottom",
          scrub: 0.4,
          invalidateOnRefresh: true
        }
      });

      items.forEach(function (item, n) {
        tl.to(item, {
          opacity: 1, y: 0,
          duration: 0.14, ease: "power2.out"
        }, HEAD_IN + n * 0.06);
      });

      // distance is a function so it recalculates on resize
      tl.to(rail, {
        x: function () {
          return -(rail.scrollWidth - window.innerWidth);
        },
        duration: 1,
        ease: "none"
      }, RAIL_FROM);

      // one trigger per card watching its real screen
      // position, rather than guessing from timeline maths.
      // survives any rail width or card count.
      cards.forEach(function (card) {
        var role = card.querySelector("[data-fam-role]");

        ScrollTrigger.create({
          trigger: track,
          start: "top top",
          end: "bottom bottom",
          onUpdate: function () {
            var r = card.getBoundingClientRect();
            var cx = r.left + r.width / 2;
            var mid = window.innerWidth / 2;
            var d = Math.abs(cx - mid) / (window.innerWidth / 2);
            var near = 1 - Math.min(d, 1);

            gsap.set(card, {
              scale: REST + (FOCUS - REST) * near,
              opacity: DIM + (1 - DIM) * near
            });

            if (role) {
              gsap.set(role, {
                opacity: Math.max(0, (near - 0.55) / 0.45)
              });
            }
          }
        });
      });

      return function () {
        gsap.set(rail, { x: 0 });
      };
    });
  });
});
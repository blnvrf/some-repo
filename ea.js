// ============================================================
// EA SITE
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


// ── LIBERTY ─────────────────────────────────────────────
// Designer:
//   liberty_track     height 200vh
//   liberty_persist   sticky, top 0, height 100svh,
//                     margin-bottom -100svh, z-index 20
//   opacity 0 handled in JS for: bg-lyr is-dark,
//   statue-lyr is-dark, bits-lyr, fx, both figures,
//   both word is-in

document.addEventListener("DOMContentLoaded", function () {
  var scenes = gsap.utils.toArray("[data-liberty-scene]");
  if (!scenes.length) return;

  gsap.registerPlugin(ScrollTrigger);

  window.addEventListener("load", function () {
    document.fonts.ready.then(function () {
      ScrollTrigger.refresh();
    });
  });

  var mm = gsap.matchMedia();

  scenes.forEach(function (scene) {
    var q = gsap.utils.selector(scene);
    var group = scene.closest("[data-liberty-group]");

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
        var host = q("[data-liberty-static]")[0];

        // right figure lives inside the scene, left figure
        // lives in the sticky persist wrapper outside it
        var figureRight = q("[data-figure]");
        var figureLeft = group
          ? gsap.utils.toArray(group.querySelectorAll("[data-figure-persist]"))
          : [];
        var allFigures = figureRight.concat(figureLeft);

        var loops = [];

        // ── specks ────────────────────────────────────────
        if (host && motionOk) {
          var COUNT = 50;
          var COLOR = "#d85a30";
          var flick = gsap.timeline({ paused: true });

          for (var i = 0; i < COUNT; i++) {
            var sp = document.createElement("span");
            sp.style.cssText =
              "position:absolute;display:block;background:" +
              COLOR + ";opacity:0;will-change:opacity";
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

          ScrollTrigger.create({
            trigger: track,
            start: "top top-=" + Math.round(track.offsetHeight * 0.35),
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

        // ── persisting figure fades out with the group ────
        if (group) {
          var persistFig = group.querySelectorAll("[data-figure-persist]");
          if (persistFig.length) {
            gsap.to(persistFig, {
              opacity: 0,
              ease: "none",
              scrollTrigger: {
                trigger: group,
                start: "bottom bottom",
                end: "bottom top+=25%",
                scrub: 0.6
              }
            });
          }
        }

        // ── bits glitch: parked, needs better values ──────

        // ── master, scrubbed ──────────────────────────────
        var tl = gsap.timeline({
          scrollTrigger: {
            trigger: track,
            start: "top top",
            end: "bottom bottom",
            scrub: 0.4
          }
        });

         var SWAP_AT = 0.62;

        swaps.forEach(function (swap, i) {
          var out = swap.querySelector('[data-word="out"]');
          var inn = swap.querySelector('[data-word="in"]');
          gsap.set(inn, { yPercent: 100, opacity: 0 });

          tl.to(out, {
            yPercent: -110, opacity: 0,
            duration: 0.5, ease: "power2.inOut"
          }, SWAP_AT);

          tl.to(inn, {
            yPercent: 0, opacity: 1,
            duration: 0.5, ease: "power2.inOut"
          }, SWAP_AT);
        });

        tl.to(bgDark, { opacity: 1, duration: 0.6, ease: "none" }, 0.5);

        tl.to(band, {
          backgroundColor: "#080331",
          duration: 0.6, ease: "none"
        }, 0.5);

        tl.to(statueDark, { opacity: 1, duration: 0.6, ease: "none" }, 0.55);
        tl.to(statueLight, { opacity: 0, duration: 0.25, ease: "none" }, 0.7);
        tl.to(bits, { opacity: 1, duration: 0.4, ease: "none" }, 0.7);

        if (host) {
          tl.to(host, { opacity: 1, duration: 0.4, ease: "none" }, 0.75);
        }

        tl.to(allFigures, {
          opacity: 1, duration: 0.25,
          ease: "power2.out", stagger: 0.08
        }, 0.85);

        tl.to({}, { duration: 1.1 }, 1.12);

                // ── figure float ──────────────────────────────────
        // own timeline, never scrubbed. paused off screen.
        if (motionOk) {
          allFigures.forEach(function (fig, i) {
            var f = gsap.timeline({
              repeat: -1,
              yoyo: true,
              paused: true,
              defaults: { ease: "sine.inOut" }
            });

            f.to(fig, {
              y: gsap.utils.random(-16, -28),
              rotate: gsap.utils.random(-3.2, 3.2),
              duration: gsap.utils.random(2.4, 3.6)
            }, i * 0.4);

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

        return function () {
          loops.forEach(function (t) { t.kill(); });
          if (host) host.innerHTML = "";
          gsap.set(bits, {
            x: 0, y: 0, opacity: 1,
            clipPath: "inset(0% 0% 0% 0%)"
          });
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
// The copy sits centred in the full frame for the first four
// beats. When the pig arrives it slides down to make room for
// the figures above it, and stays there.
//
// Designer:
//   pig_track     height 500vh
//   pig_sticky    sticky, top 0, height 100svh, overflow hidden
//   pig_bg        position absolute, inset 0, z-index 0
//
//   pig_scale     position relative, z-index 1,
//                 display flex, align-items flex-end,
//                 justify-content center, gap 4vw,
//                 padding-left 5vw, padding-right 5vw
//     pig_side    flex 0 0 26vw, flex column, align-items center
//                 combos is-human and is-pig
//     pig_herd    display flex, flex-wrap wrap, width 100%,
//                 height auto, gap 2%
//     pig_fig-img height auto, NO object-fit, NO max-height
//
//   padding-global  position ABSOLUTE, inset 0, z-index 1,
//                   width 100%, height 100%
//                   Must be absolute, not a flex child. As a
//                   flex child it takes the leftover space
//                   under pig_scale and the copy is already
//                   pinned low, so there is nothing to drop.
//     container-large  height 100%
//       pig_stack      data-pig-stack, position relative,
//                      height 100%, flex, centered
//         pig_line     data-pig-line, position absolute,
//                      width 100%, text-align center
//           pig_line-txt  data-pig-txt, display block
//
//   Exactly TWO pig_fig-img inside pig_herd in the Designer:
//   the seed, and one carrying the is-stack combo so the
//   class publishes. The script clones the rest to 10.
//
//   Check before debugging:
//     console.log(
//       document.querySelectorAll("[data-pig-stack]").length,
//       document.querySelectorAll("[data-pig-line]").length,
//       document.querySelectorAll("[data-pig-txt]").length);
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
    var BEATS = [
      { pigs: 0,  human: false },  //  1  religion of Silicon Valley
      { pigs: 0,  human: false },  //  2  here are its tenets
      { pigs: 0,  human: false },  //  3  Effective:
      { pigs: 0,  human: false },  //  4  Altruism:
      { pigs: 1,  human: true  },  //  5  who can argue against
      { pigs: 1,  human: true  },  //  6  what does that look like
      { pigs: 2,  human: true  },  //  7  0.51 math
      { pigs: 2,  human: true  },  //  8  not so fast
      { pigs: 10, human: true  },  //  9  five to ten pigs
      { pigs: 10, human: true  },  // 10  it's logical
      { pigs: 10, human: true  }   // 11  spare
    ];

    // ── config ────────────────────────────────────────────
    var STEP = 0.14;         // spacing between beats
    var HOLD = 0.14;         // figure fade duration
    var FADE = 0.10;         // text fade duration
    var TEXT_LOW = "34vh";   // how far the copy drops once the
                             // figures arrive. raise if they overlap.

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
      // hidden pigs are display none, so every smaller count
      // is a subset of the same layout.
      gsap.set(herdBox, { flexWrap: "wrap" });
      gsap.set(herd, { width: "31%", height: "auto" });

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
        var txt = line.querySelector("[data-pig-txt]");
        var beat = BEATS[i] || BEATS[BEATS.length - 1];
        var prev = i > 0 ? BEATS[i - 1] : { pigs: 0, human: false };
        var last = i === lines.length - 1;

        // ── copy: fades out BEFORE the next fades in ─────
        // the fade-out finishes exactly as the next beat
        // starts, so two lines are never on screen together
        if (txt) {
          gsap.set(txt, { opacity: 0 });

          tl.to(txt, {
            opacity: 1, duration: FADE, ease: "power1.out"
          }, at);

          if (!last) {
            tl.to(txt, {
              opacity: 0, duration: FADE, ease: "power1.in"
            }, at + STEP - FADE);
          }
        }

        // ── the copy drops once, when the pig first shows ─
        if (stack && beat.pigs > 0 && prev.pigs === 0) {
          tl.to(stack, {
            y: TEXT_LOW,
            duration: 0.20,
            ease: "power2.inOut"
          }, at);
        }

        // ── figures: absolute state at every beat ───────
        tl.to(human, {
          opacity: beat.human ? 1 : 0,
          duration: HOLD, ease: "none"
        }, at);

        tl.to(op, {
          opacity: beat.human && beat.pigs > 0 ? 1 : 0,
          duration: HOLD, ease: "none"
        }, at);

        tl.to(pigSide, {
          opacity: beat.pigs > 0 ? 1 : 0,
          duration: HOLD, ease: "none"
        }, at);

        herd.forEach(function (pig, idx) {
          tl.set(pig, {
            display: idx < beat.pigs ? "block" : "none"
          }, at);

          tl.to(pig, {
            opacity: idx < beat.pigs ? 1 : 0,
            duration: HOLD, ease: "none"
          }, at + idx * 0.008);
        });

        if (pigCount) {
          tl.to(pigCount, {
            duration: HOLD,
            snap: { innerText: 1 },
            innerText: beat.pigs,
            ease: "none"
          }, at);
        }

        // ── torn quote on the final beat ────────────────
        if (last && quote.length) {
          tl.fromTo(quote,
            { opacity: 0, y: 60, rotate: -8 },
            {
              opacity: 1, y: 0, rotate: -2,
              duration: 0.22, ease: "power3.out"
            },
            at
          );
        }
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
// Timing philosophy: every beat finishes before the next one
// starts. The gaps are deliberate. If a transition feels
// rushed, widen the gap rather than slowing the tween.
//
// Designer:
//   math_track     height 700vh
//   math_field     absolute, inset 0, z-index 2, two image
//                  layers, data-math-field all and lit
//   math_caption   Div, absolute, top 50%, left 50%, width auto,
//                  flex column, background colour, padding,
//                  z-index 3, NO transform
//     math_caption-head  data-math-head, placeholder text needed
//     math_caption-sub   data-math-sub, placeholder text needed
//   math_burst     absolute, top 50%, left 50%, 6px circle,
//                  z-index 4, NO transform
//   math_end       absolute, inset 0, z-index 5, centered
//
//   Exports: dots-all and dots-lit, identical canvas,
//   identical dot positions, nine lit dots dead centre.

document.addEventListener("DOMContentLoaded", function () {
  gsap.utils.toArray("[data-math-scene]").forEach(function (sec) {
    var mq = gsap.utils.selector(sec);

    var track = mq("[data-math-track]")[0];
    var stack = mq("[data-math-stack]")[0];
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

    var STEP = 0.16;
    var BURST = 420;
    var CAP_TOP = "8vh";
    var FIELD_REST = 0;
    var XFADE = 0.40;

    var CAPTION_1 = "People who do not exist yet";
    var SUB_1 = "10^58 potential future lives";
    var CAPTION_2 = "8,000,000,000";
    var SUB_2 = "Everyone alive today";

    gsap.matchMedia().add("(min-width: 992px)", function () {
      gsap.set(items, { opacity: 0, y: 24, display: "none" });
      gsap.set(stack, { opacity: 1 });
      gsap.set(field, { opacity: 0, yPercent: 100 });
      gsap.set(fieldAll, { opacity: 1 });
      gsap.set(fieldLit, { opacity: 0 });
      gsap.set(caption, { opacity: 0, xPercent: -50, yPercent: -50 });
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

      // display toggles because a hidden item in normal flow
      // still holds its space, and nothing would push
      items.forEach(function (item, i) {
        var at = i * STEP;
        tl.set(item, { display: "block" }, at);
        tl.to(item, {
          opacity: 1, y: 0,
          duration: 0.14, ease: "power2.out"
        }, at);
      });

      var afterStack = items.length * STEP;

      tl.to(stack, {
        opacity: 0, duration: 0.16, ease: "power1.in"
      }, afterStack + 0.10);

      var capAt = afterStack + 0.44;

      tl.set(capHead, { innerText: CAPTION_1 }, capAt - 0.01);
      tl.set(capSub, { innerText: SUB_1 }, capAt - 0.01);

      tl.to(caption, {
        opacity: 1, duration: 0.18, ease: "power2.out"
      }, capAt);

      // the field rises and pushes the caption up. both move
      // on the same ease and overlap, so it reads as contact
      // even though they never touch.
      var fieldAt = afterStack + 0.80;

      tl.to(field, {
        opacity: 1, yPercent: FIELD_REST,
        duration: 0.38, ease: "power2.out"
      }, fieldAt);

      tl.to(caption, {
        top: CAP_TOP, yPercent: 0,
        duration: 0.34, ease: "power2.out"
      }, fieldAt + 0.06);

      var litAt = afterStack + 1.50;

      tl.to(fieldLit, { opacity: 1, duration: XFADE, ease: "none" }, litAt);
      tl.to(fieldAll, { opacity: 0, duration: XFADE, ease: "none" }, litAt + 0.06);

      // text swaps in one frame at 80% through the cross-fade,
      // so the caption background never leaves the screen
      tl.set(capHead, { innerText: CAPTION_2 }, litAt + XFADE * 0.8);
      tl.set(capSub, { innerText: SUB_2 }, litAt + XFADE * 0.8);

      var burstAt = afterStack + 2.36;

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
// Strict sequence, nothing overlaps. One beat cycle:
//   0.00  head fades in
//   0.02  copy fades in
//   0.46  quote slapped on
//   0.64  whole block thrown up and left, ends 0.84
//   0.86  block hidden, frame empty
//   0.88  background turns, ends 1.06
//   1.08  next block starts
//
// Designer: opt_track height 1200vh.
// Background colours live in data-opt-bg on each block.
// Check after duplicating a block:
//   document.querySelectorAll("[data-opt-block]").forEach(
//     function(b,i){ console.log(i,
//       !!b.querySelector("[data-opt-head]"),
//       !!b.querySelector("[data-opt-copy]"),
//       !!b.querySelector("[data-opt-quote]")); });

document.addEventListener("DOMContentLoaded", function () {
  gsap.utils.toArray("[data-opt-scene]").forEach(function (sec) {
    var oq = gsap.utils.selector(sec);

    var track = oq("[data-opt-track]")[0];
    var sticky = track ? track.firstElementChild : null;
    var intro = oq("[data-opt-intro]");
    var blocks = oq("[data-opt-block]");

    if (!track || !sticky || !blocks.length) return;

    var INTRO_BG = "#d85a30";
    var BEAT = 1.08;
    var INTRO_OUT = 0.34;
    var FIRST = 0.72;
    var SLAP = 0.46;
    var THROW = 0.64;

    gsap.matchMedia().add("(min-width: 992px)", function () {
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

      tl.to(intro, {
        opacity: 0, y: -60,
        duration: 0.16, ease: "power2.in"
      }, INTRO_OUT);

      blocks.forEach(function (block, i) {
        var at = FIRST + i * BEAT;

        var head = block.querySelector("[data-opt-head]");
        var copy = block.querySelector("[data-opt-copy]");
        var quote = block.querySelector("[data-opt-quote]");
        var bg = block.getAttribute("data-opt-bg") || INTRO_BG;
        var last = i === blocks.length - 1;

        // background turns while the frame is empty
        tl.to(sticky, {
          backgroundColor: bg, duration: 0.18, ease: "none"
        }, at - 0.20);

        tl.set(block, { opacity: 1 }, at - 0.02);

        tl.to(head, {
          opacity: 1, y: 0, duration: 0.10, ease: "power2.out"
        }, at);

        tl.to(copy, {
          opacity: 1, y: 0, duration: 0.10, ease: "power2.out"
        }, at + 0.02);

        // the slap. fast, oversized, off-angle, hard stop.
        // anything slower than 0.07 reads as arriving.
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
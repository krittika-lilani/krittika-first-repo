const staticSketch = (p) => {
  let animationPhaseName = "idle";
  let phaseStartTime = 0;
  let breadMoveAmount = 0;
  let breadPressAmount = 0;
  let yolkBreakAmount = 0;
  let disturbedSauceAmount = 0;
  const movingBreadDuration = 800;
  const breakingYolkDuration = 1050;

  // The lower point of this bread shape is the "tip" that touches the egg.
  const breadTip = { x: 255, y: 226 };

  // This point is placed on the visible yellow yolk of the nearest poached egg.
  const yolkContactPoint = { x: 272, y: 306 };

  p.setup = function () {
    p.pixelDensity(1);
    let canvas = p.createCanvas(600, 600);
    canvas.parent("static-canvas-container");

    // The button starts one short animation. The canvas does not loop until this is clicked.
    let yolkButton = document.querySelector(".yolk-button");
    yolkButton.addEventListener("click", function () {
      animationPhaseName = "movingBread";
      phaseStartTime = p.millis();
      breadMoveAmount = 0;
      breadPressAmount = 0;
      yolkBreakAmount = 0;
      disturbedSauceAmount = 0;
      p.loop();
    });

    p.noLoop();
  };

  p.draw = function () {
    updateAnimationPhase();

    p.background(255, 250, 242);

    // Draw a very soft table shadow so the plate sits on the page.
    p.noStroke();
    p.fill(176, 132, 74, 22);
    p.ellipse(304, 334, 470, 430);
    p.fill(176, 132, 74, 12);
    p.ellipse(309, 349, 398, 352);

    // Draw a refined ceramic plate with soft glaze layers.
    p.fill(250, 244, 229);
    p.stroke(92, 69, 48, 95);
    p.strokeWeight(1.4);
    p.ellipse(300, 320, 462, 428);

    p.noFill();
    p.stroke(255, 255, 248, 175);
    p.strokeWeight(10);
    p.ellipse(294, 310, 421, 390);

    p.stroke(177, 154, 112, 60);
    p.strokeWeight(1.5);
    p.ellipse(300, 320, 398, 370);
    p.stroke(84, 61, 43, 38);
    p.ellipse(300, 322, 346, 318);

    p.noStroke();
    p.fill(255, 251, 239, 230);
    p.ellipse(300, 324, 340, 314);
    p.fill(245, 235, 210, 42);
    p.ellipse(306, 335, 282, 244);

    // Add a blue floral ceramic rim pattern with repeated stems, leaves, dots, and flowers.
    drawCeramicRim();

    // Draw the still piece of flatbread before the food layers.
    drawFlatbreadBackPiece();

    // Draw a faint warm-grey contact shadow before the yogurt goes down.
    drawYogurtShadow();

    // Draw the yogurt as a cool-white organic layer on the plate.
    drawYogurtBlob();

    // Let some chili butter sit on the yogurt but disappear beneath the eggs.
    drawChiliButterMiddle(disturbedSauceAmount);

    // Add tiny contact shadows so the poached eggs sit above the yogurt.
    drawEggContactShadow(258, 297, -10);
    drawEggContactShadow(354, 334, 8);

    // Draw poached eggs as warm, pillowy forms above the yogurt.
    drawPoachedEgg(258, 297, -10, yolkBreakAmount);
    drawPoachedEgg(354, 334, 8);

    // Draw the broken yolk after the egg, so it spreads over the egg and yogurt.
    drawBrokenYolk(yolkBreakAmount);

    // Add final chili oil accents, spice flecks, and dill on the top layer.
    drawChiliButterOver(disturbedSauceAmount);
    drawSpiceFlecks(yolkBreakAmount);
    drawDill();

    // The moving bread is drawn last so it always appears above sauce, yogurt, eggs, and herbs.
    drawMovingFlatbread(breadMoveAmount, breadPressAmount);
  };

  function smoothStep(amount) {
    // Smooths a 0-to-1 value so lerp() movement starts and ends gently.
    return amount * amount * (3 - 2 * amount);
  }

  function updateAnimationPhase() {
    // Phase order: idle -> movingBread -> breakingYolk -> finished.
    if (animationPhaseName === "idle") {
      breadMoveAmount = 0;
      breadPressAmount = 0;
      yolkBreakAmount = 0;
      disturbedSauceAmount = 0;
      return;
    }

    if (animationPhaseName === "movingBread") {
      let moveProgress = p.constrain(
        (p.millis() - phaseStartTime) / movingBreadDuration,
        0,
        1
      );
      breadMoveAmount = smoothStep(moveProgress);
      breadPressAmount = 0;
      yolkBreakAmount = 0;
      disturbedSauceAmount = 0;

      // The yolk starts breaking exactly when the bread reaches the target point.
      if (moveProgress >= 1) {
        animationPhaseName = "breakingYolk";
        phaseStartTime = p.millis();
        breadMoveAmount = 1;
      }
      return;
    }

    if (animationPhaseName === "breakingYolk") {
      let breakProgress = p.constrain(
        (p.millis() - phaseStartTime) / breakingYolkDuration,
        0,
        1
      );
      breadMoveAmount = 1;
      breadPressAmount = smoothStep(breakProgress);
      yolkBreakAmount = smoothStep(breakProgress);
      disturbedSauceAmount = smoothStep(breakProgress);

      if (breakProgress >= 1) {
        animationPhaseName = "finished";
        breadMoveAmount = 1;
        breadPressAmount = 1;
        yolkBreakAmount = 1;
        disturbedSauceAmount = 1;
        p.noLoop();
      }
      return;
    }

    // Finished keeps the final broken-yolk drawing visible.
    breadMoveAmount = 1;
    breadPressAmount = 1;
    yolkBreakAmount = 1;
    disturbedSauceAmount = 1;
  }

  function drawCeramicRim() {
    p.push();
    p.translate(300, 320);

    for (let angle = 0; angle < 360; angle += 24) {
      let a = p.radians(angle);
      let x = p.cos(a) * 198;
      let y = p.sin(a) * 184;

      p.push();
      p.translate(x, y);
      p.rotate(a + p.HALF_PI);

      // Tiny vine stem.
      p.noFill();
      p.stroke(46, 109, 151, 120);
      p.strokeWeight(1.4);
      p.arc(0, 1, 19, 22, p.radians(205), p.radians(335));
      p.line(0, -9, 0, 10);

      // Paired ceramic leaves, drawn as small tilted ellipses.
      p.noStroke();
      p.fill(50, 122, 158, 105);
      p.ellipse(-7, -2, 5, 13);
      p.ellipse(7, 3, 5, 13);
      p.ellipse(-4, 9, 4, 10);

      // Simple flower made from tiny dots.
      p.fill(38, 93, 145, 130);
      p.circle(0, -13, 4);
      p.circle(-4, -10, 3);
      p.circle(4, -10, 3);
      p.circle(0, -7, 3);
      p.pop();
    }

    // Small blue dots between the vine motifs.
    for (let angle = 12; angle < 360; angle += 24) {
      let a = p.radians(angle);
      p.noStroke();
      p.fill(52, 118, 156, 75);
      p.circle(p.cos(a) * 201, p.sin(a) * 187, 3.2);
    }

    p.pop();
  }

  function drawFlatbreadBackPiece() {
    // Still flatbread piece stays tucked near the top of the plate.
    p.stroke(137, 98, 55, 86);
    p.strokeWeight(1.2);
    p.fill(229, 187, 119);
    p.beginShape();
    p.curveVertex(139, 158);
    p.curveVertex(139, 158);
    p.curveVertex(182, 122);
    p.curveVertex(245, 128);
    p.curveVertex(266, 160);
    p.curveVertex(236, 203);
    p.curveVertex(171, 206);
    p.curveVertex(138, 181);
    p.curveVertex(139, 158);
    p.curveVertex(139, 158);
    p.endShape();

    p.noStroke();
    p.fill(255, 226, 158, 62);
    p.beginShape();
    p.curveVertex(156, 159);
    p.curveVertex(156, 159);
    p.curveVertex(191, 139);
    p.curveVertex(237, 145);
    p.curveVertex(243, 167);
    p.curveVertex(219, 188);
    p.curveVertex(170, 190);
    p.curveVertex(156, 159);
    p.curveVertex(156, 159);
    p.endShape();

    // Browned spots and layered edge marks make the bread feel soft.
    p.noStroke();
    p.fill(157, 99, 43, 48);
    p.ellipse(183, 159, 31, 16);
    p.ellipse(218, 185, 36, 14);
    p.fill(255, 236, 182, 45);
    p.ellipse(201, 149, 42, 18);

    p.stroke(116, 79, 41, 50);
    p.strokeWeight(1.4);
    p.line(152, 198, 233, 199);
    p.line(152, 174, 181, 128);
  }

  function drawMovingFlatbread(moveAmount, pressAmount) {
    // The target translation is calculated so the bread tip lands on the visible yolk.
    let targetX = yolkContactPoint.x - breadTip.x;
    let targetY = yolkContactPoint.y - breadTip.y;
    let slideX = p.lerp(0, targetX, moveAmount);
    let slideY = p.lerp(0, targetY, moveAmount);

    // Once the tip reaches the yolk, it presses only a few pixels farther.
    let pressX = p.lerp(0, 4, pressAmount);
    let pressY = p.lerp(0, 3, pressAmount);
    let turn = p.lerp(0, -3, moveAmount) + p.lerp(0, 1, pressAmount);

    p.push();
    p.translate(slideX + pressX, slideY + pressY);

    // Rotate around the bread tip, so the tip stays on the yolk contact point.
    p.translate(breadTip.x, breadTip.y);
    p.rotate(p.radians(turn));
    p.translate(-breadTip.x, -breadTip.y);

    // A very soft contact mark appears only while the bread presses the egg.
    p.noStroke();
    p.fill(116, 83, 48, 16 * pressAmount);
    p.ellipse(breadTip.x, breadTip.y + 3, 84, 31);

    p.stroke(136, 96, 54, 78);
    p.strokeWeight(1.2);
    p.fill(238, 198, 128);
    p.beginShape();
    p.curveVertex(222, 149);
    p.curveVertex(222, 149);
    p.curveVertex(283, 134);
    p.curveVertex(314, 156);
    p.curveVertex(309, 216);
    p.curveVertex(255, 226);
    p.curveVertex(217, 190);
    p.curveVertex(222, 149);
    p.curveVertex(222, 149);
    p.endShape();

    // Bread texture and soft browned spots move with this piece.
    p.noStroke();
    p.fill(157, 99, 43, 48);
    p.ellipse(273, 164, 27, 13);
    p.ellipse(276, 209, 33, 12);
    p.fill(255, 236, 182, 45);
    p.ellipse(262, 190, 44, 17);

    p.stroke(116, 79, 41, 50);
    p.strokeWeight(1.4);
    p.line(235, 220, 302, 212);

    p.pop();
  }

  function drawYogurtShadow() {
    // Extremely soft shadow separates the yogurt from the ceramic plate.
    p.noStroke();
    p.fill(118, 103, 86, 14);
    p.beginShape();
    p.curveVertex(245, 209);
    p.curveVertex(245, 209);
    p.curveVertex(318, 192);
    p.curveVertex(389, 217);
    p.curveVertex(433, 277);
    p.curveVertex(430, 351);
    p.curveVertex(377, 421);
    p.curveVertex(299, 445);
    p.curveVertex(221, 416);
    p.curveVertex(174, 350);
    p.curveVertex(183, 271);
    p.curveVertex(245, 209);
    p.curveVertex(245, 209);
    p.endShape();

    p.fill(118, 103, 86, 7);
    p.ellipse(306, 336, 308, 276);
  }

  function drawChiliButterMiddle(disturbAmount) {
    // Translucent oil pools sit on the yogurt; the eggs will cover parts of them.
    let oilShiftX = p.lerp(0, 6, disturbAmount);
    let oilShiftY = p.lerp(0, 3, disturbAmount);

    p.push();
    p.translate(oilShiftX, oilShiftY);

    p.noStroke();
    p.fill(210, 69, 31, 126);
    p.beginShape();
    p.curveVertex(199, 306);
    p.curveVertex(199, 306);
    p.curveVertex(235, 253);
    p.curveVertex(306, 231);
    p.curveVertex(382, 249);
    p.curveVertex(421, 302);
    p.curveVertex(403, 366);
    p.curveVertex(342, 407);
    p.curveVertex(267, 402);
    p.curveVertex(207, 364);
    p.curveVertex(199, 306);
    p.curveVertex(199, 306);
    p.endShape();

    p.fill(239, 125, 39, 112);
    p.beginShape();
    p.curveVertex(226, 291);
    p.curveVertex(226, 291);
    p.curveVertex(282, 255);
    p.curveVertex(353, 257);
    p.curveVertex(394, 303);
    p.curveVertex(379, 356);
    p.curveVertex(321, 384);
    p.curveVertex(256, 375);
    p.curveVertex(218, 339);
    p.curveVertex(226, 291);
    p.curveVertex(226, 291);
    p.endShape();

    p.noFill();
    p.stroke(178, 50, 30, 82);
    p.strokeWeight(10);
    p.arc(307, 319, 260, 211, p.radians(24), p.radians(106));
    p.arc(303, 326, 278, 226, p.radians(210), p.radians(302));

    p.pop();
  }

  function drawYogurtBlob() {
    // Main yogurt shape: irregular, cool white, and not perfectly circular.
    p.noStroke();
    p.fill(250, 252, 249, 240);
    p.beginShape();
    p.curveVertex(242, 198);
    p.curveVertex(242, 198);
    p.curveVertex(314, 180);
    p.curveVertex(381, 204);
    p.curveVertex(425, 265);
    p.curveVertex(422, 342);
    p.curveVertex(371, 414);
    p.curveVertex(296, 436);
    p.curveVertex(221, 406);
    p.curveVertex(180, 342);
    p.curveVertex(188, 263);
    p.curveVertex(242, 198);
    p.curveVertex(242, 198);
    p.endShape();

    // Subtle cream shadows help the yogurt feel thick.
    p.fill(222, 225, 220, 36);
    p.beginShape();
    p.curveVertex(230, 254);
    p.curveVertex(230, 254);
    p.curveVertex(300, 222);
    p.curveVertex(374, 243);
    p.curveVertex(400, 312);
    p.curveVertex(365, 382);
    p.curveVertex(284, 405);
    p.curveVertex(219, 366);
    p.curveVertex(208, 297);
    p.curveVertex(230, 254);
    p.curveVertex(230, 254);
    p.endShape();

    p.fill(255, 255, 254, 100);
    p.beginShape();
    p.curveVertex(235, 286);
    p.curveVertex(235, 286);
    p.curveVertex(276, 247);
    p.curveVertex(341, 247);
    p.curveVertex(377, 283);
    p.curveVertex(350, 315);
    p.curveVertex(285, 323);
    p.curveVertex(236, 306);
    p.curveVertex(235, 286);
    p.curveVertex(235, 286);
    p.endShape();

    p.fill(255, 255, 255, 96);
    p.ellipse(270, 250, 116, 44);
    p.ellipse(355, 291, 104, 40);
    p.ellipse(248, 353, 88, 32);
    p.ellipse(342, 387, 94, 31);
  }

  function drawEggContactShadow(x, y, turn) {
    // Tiny soft contact shadow only separates egg from yogurt.
    p.push();
    p.translate(x, y);
    p.rotate(p.radians(turn));
    p.noStroke();
    p.fill(118, 96, 74, 13);
    p.ellipse(2, 17, 126, 70);
    p.fill(118, 96, 74, 7);
    p.ellipse(7, 24, 104, 49);
    p.pop();
  }

  function drawPoachedEgg(x, y, turn, breakAmount = 0) {
    p.push();
    p.translate(x, y);
    p.rotate(p.radians(turn));

    // Soft lower white gives the poached egg a folded base.
    p.noStroke();
    p.fill(252, 244, 230, 155);
    p.beginShape();
    p.curveVertex(-62, 10);
    p.curveVertex(-62, 10);
    p.curveVertex(-36, -24);
    p.curveVertex(21, -29);
    p.curveVertex(62, -5);
    p.curveVertex(60, 38);
    p.curveVertex(19, 59);
    p.curveVertex(-38, 49);
    p.curveVertex(-62, 10);
    p.curveVertex(-62, 10);
    p.endShape();

    // Irregular top white, more like a poached egg than a fried egg.
    p.fill(255, 250, 238, 224);
    p.beginShape();
    p.curveVertex(-65, -11);
    p.curveVertex(-65, -11);
    p.curveVertex(-37, -49);
    p.curveVertex(14, -55);
    p.curveVertex(58, -32);
    p.curveVertex(70, 9);
    p.curveVertex(42, 43);
    p.curveVertex(-17, 50);
    p.curveVertex(-61, 24);
    p.curveVertex(-65, -11);
    p.curveVertex(-65, -11);
    p.endShape();

    // The yolk sits under the white, so it is warm but partly veiled.
    p.fill(230, 126, 42, 145 * (1 - breakAmount * 0.45));
    p.ellipse(13, 9, 56, 36);
    p.fill(255, 196, 73, 96 * (1 - breakAmount * 0.45));
    p.ellipse(3, 4, 34, 21);

    // Thin egg-white folds overlap the yolk.
    p.fill(255, 253, 244, 150);
    p.ellipse(-16, -8, 76, 40);
    p.fill(255, 251, 240, 116);
    p.ellipse(18, 15, 76, 35);
    p.fill(238, 226, 206, 52);
    p.ellipse(-3, 26, 100, 30);

    p.pop();
  }

  function drawBrokenYolk(breakAmount) {
    // Once the bread presses in, layered translucent yolk spreads from the contact point.
    if (breakAmount <= 0) {
      return;
    }

    let spread = breakAmount;
    let wide = p.lerp(18, 118, spread);
    let tall = p.lerp(8, 46, spread);
    let drip = p.lerp(0, 55, spread);
    let cx = yolkContactPoint.x;
    let cy = yolkContactPoint.y;

    p.noStroke();

    p.fill(239, 134, 36, 142 * spread);
    p.beginShape();
    p.curveVertex(cx - 8, cy - 2);
    p.curveVertex(cx - 8, cy - 2);
    p.curveVertex(cx + wide * 0.25, cy - 13);
    p.curveVertex(cx + wide * 0.65, cy + 4);
    p.curveVertex(cx + wide * 0.55, cy + tall * 0.55);
    p.curveVertex(cx + wide * 0.08, cy + tall * 0.82);
    p.curveVertex(cx - wide * 0.35, cy + tall * 0.46);
    p.curveVertex(cx - wide * 0.36, cy + 8);
    p.curveVertex(cx - 8, cy - 2);
    p.curveVertex(cx - 8, cy - 2);
    p.endShape();

    p.fill(255, 181, 58, 122 * spread);
    p.ellipse(cx + 26 + drip * 0.2, cy + 14 + drip * 0.12, wide, tall);
    p.ellipse(cx + 58 + drip * 0.38, cy + 33 + drip * 0.22, wide * 0.62, tall * 0.55);

    p.fill(255, 209, 90, 88 * spread);
    p.ellipse(cx + 9 + drip * 0.14, cy + 4, wide * 0.48, tall * 0.42);
  }

  function drawChiliButterOver(disturbAmount) {
    // Smaller top oil accents overlap yogurt and egg whites.
    let oilShiftX = p.lerp(0, 4, disturbAmount);
    let oilShiftY = p.lerp(0, -3, disturbAmount);

    p.push();
    p.translate(oilShiftX, oilShiftY);

    p.noStroke();
    p.fill(238, 116, 36, 132);
    p.beginShape();
    p.curveVertex(268, 221);
    p.curveVertex(268, 221);
    p.curveVertex(306, 211);
    p.curveVertex(343, 223);
    p.curveVertex(327, 238);
    p.curveVertex(284, 237);
    p.curveVertex(268, 221);
    p.curveVertex(268, 221);
    p.endShape();

    p.beginShape();
    p.curveVertex(293, 416);
    p.curveVertex(293, 416);
    p.curveVertex(340, 405);
    p.curveVertex(381, 418);
    p.curveVertex(355, 438);
    p.curveVertex(305, 434);
    p.curveVertex(293, 416);
    p.curveVertex(293, 416);
    p.endShape();

    p.beginShape();
    p.curveVertex(414, 360);
    p.curveVertex(414, 360);
    p.curveVertex(446, 352);
    p.curveVertex(464, 365);
    p.curveVertex(443, 379);
    p.curveVertex(416, 374);
    p.curveVertex(414, 360);
    p.curveVertex(414, 360);
    p.endShape();

    p.noFill();
    p.stroke(148, 39, 29, 76);
    p.strokeWeight(7);
    p.arc(286, 318, 230, 174, p.radians(-20), p.radians(28));
    p.arc(315, 327, 246, 202, p.radians(154), p.radians(190));

    p.pop();
  }

  function drawSpiceFlecks(breakAmount = 0) {
    p.noStroke();
    p.fill(133, 31, 24);
    p.circle(247, 241, 5);
    p.circle(303, 265, 4);
    p.circle(392, 294, 5);
    p.circle(220, 361, 5);
    p.circle(315, 379, 4);
    p.circle(374, 397, 5);
    p.circle(278, 344, 3);
    p.circle(420, 329, 4);
    p.circle(193, 292, 4);
    p.circle(353, 245, 3);
    p.circle(406, 374, 4);

    // A few extra flakes appear near the broken yolk at the end of the click animation.
    p.fill(133, 31, 24, 210 * breakAmount);
    p.circle(268, 318, 3.5);
    p.circle(303, 333, 4);
    p.circle(330, 348, 3);
    p.circle(286, 354, 3.5);
  }

  function drawDill() {
    p.stroke(83, 119, 57);
    p.strokeWeight(2);

    drawDillSprig(231, 268, -20);
    drawDillSprig(334, 286, 16);
    drawDillSprig(384, 357, -12);
    drawDillSprig(257, 391, 18);
    drawDillSprig(410, 309, 24);
    drawDillSprig(204, 314, -28);
  }

  function drawDillSprig(x, y, turn) {
    p.push();
    p.translate(x, y);
    p.rotate(p.radians(turn));

    p.line(0, 0, 18, -12);
    p.line(7, -5, 3, -13);
    p.line(10, -7, 15, -16);
    p.line(13, -9, 23, -10);

    p.pop();
  }
};

new p5(staticSketch);

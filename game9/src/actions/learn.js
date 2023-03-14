import { getKnowledgeLevel, progressOnKnowledge } from "../context.js";
import STATE from "../state.js";
import { Button, ProgressBar, typedMessage } from "../ui/ui.js";
import { Deffered } from "../utils.js";

function actionStart(scene, topic, progressStart) {
  var deferred = new Deffered();
  var width = 300;
  var centerX = scene.scale.width / 2;
  var startY = scene.scale.height / 2 + 12;
  let topic_cost = topic.cost;
  let advance_value = Math.max(0.01, STATE.ACTION_STUDY / topic_cost);
  let progress = progressStart;

  var progressBar = new ProgressBar(
    scene,
    scene.scale.width / 2 - width / 2,
    startY,
    width,
    12
  );
  progressBar.setValue(progress);
  var progressText = scene.add
    .bitmapText(centerX, startY - 32, "font1", [parseInt(progress) + "%"], 32)
    .setCenterAlign()
    .setTint(0xfff1a1)
    .setOrigin(0.5, 1);
  var tazaText = scene.add
    .bitmapText(
      centerX,
      startY - 12,
      "font1",
      ["Taza de progreso: " + STATE.ACTION_STUDY + "/" + topic_cost],
      16
    )
    .setCenterAlign()
    .setTint(0xfff1a1)
    .setOrigin(0.5, 1);
  var titleBar = scene.add
    .bitmapText(centerX, startY - 150, "font1", ["ESTUDIANDO", topic.text], 16)
    .setCenterAlign()
    .setMaxWidth(width)
    .setOrigin(0.5, 1);

  const cancelButton = new Button(
    scene,
    titleBar.x,
    startY - 120,
    "Cancelar"
  ).onClick(() => {
    onended();
  });
  cancelButton.x -= cancelButton.width / 2;
  var helptext = scene.add
    .bitmapText(
      centerX,
      scene.scale.height - 12,
      "font1",
      [
        progress < 100
          ? "CLICK RAPIDO PARA ESTUDIAR"
          : "YA NO TENGO NADA MAS QUE APRENDER",
      ],
      16
    )
    .setOrigin(0.5, 1);

  var unbind = scene.player.onAct(() => {
    progress += advance_value;
    progressBar.setValue(progress);
    progressText.setText([parseInt(progress) + "%"]);
    if (progress >= 100) {
      onended();
    }
  });

  const onended = () => {
    unbind();
    titleBar.destroy();
    progressBar.destroy();
    cancelButton.destroy();
    helptext.destroy();
    tazaText.destroy();
    progressText.destroy();
    deferred.resolve();
    progressOnKnowledge(topic.text, progress);
  };

  if (progress >= 100) {
    onended();
  }

  return deferred.promise;
}
export default async function learn(scene, topic) {
  // add progress bar of day at top
  scene.menu.hide();
  scene.time.timeScale = 2;
  let progress = getKnowledgeLevel(topic.text);
  if (progress < 100) {
    await actionStart(scene, topic, progress);
  } else {
    let message1 = typedMessage(
      scene,
      ["Ya domine este tema!!"],
      scene.scale.width / 2,
      scene.scale.height / 2 + 12,
      32
    );
    await message1.promise;
  }

  scene.menu.show();
  scene.time.timeScale = 1;
}

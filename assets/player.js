const audio = document.querySelector("#audio");

if (audio.hasAttribute("src")) {
  const play = document.querySelector("#play");
  const icon = document.querySelector("#playicon");
  const seek = document.querySelector("#seek");
  const current = document.querySelector("#current");
  const duration = document.querySelector("#duration");
  const progress = document.querySelector("#wave-progress");
  const status = document.querySelector("#status");

  const playIcon = "M8 5.5v13L19 12z";
  const pauseIcon = "M7 5h4v14H7z M14 5h4v14h-4z";
  const unavailable = "Аудиофрагмент пока недоступен";

  function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainder = String(Math.floor(seconds % 60)).padStart(2, "0");
    return `${minutes}:${remainder}`;
  }

  function showStatus(message = "") {
    status.hidden = !message;
    status.textContent = message;
  }

  function updatePlayback() {
    const paused = audio.paused || audio.ended;
    icon.setAttribute("d", paused ? playIcon : pauseIcon);
    play.setAttribute(
      "aria-label",
      paused ? "Воспроизвести фрагмент" : "Пауза",
    );
  }

  function updateTime() {
    const total = audio.duration;
    const ready = !audio.error && Number.isFinite(total) && total > 0;
    const elapsed = ready ? Math.min(audio.currentTime, total) : 0;
    current.textContent = formatTime(elapsed);
    duration.textContent = ready ? formatTime(total) : "—:—";
    progress.setAttribute(
      "width",
      ready ? String((360 * elapsed) / total) : "0",
    );
    seek.disabled = !ready;
    if (ready) {
      seek.max = total;
      seek.value = elapsed;
      seek.setAttribute(
        "aria-valuetext",
        `${formatTime(elapsed)} из ${formatTime(total)}`,
      );
    }
  }

  function handleError() {
    showStatus(unavailable);
    play.disabled = true;
    updateTime();
    updatePlayback();
  }

  play.addEventListener("click", async () => {
    if (!audio.paused && !audio.ended) {
      audio.pause();
      return;
    }

    if (audio.readyState < HTMLMediaElement.HAVE_FUTURE_DATA) {
      showStatus("Аудиофрагмент загружается…");
    }

    try {
      await audio.play();
    } catch (error) {
      if (audio.error || error.name === "NotSupportedError") {
        handleError();
      } else if (error.name !== "AbortError") {
        showStatus("Не удалось начать воспроизведение. Попробуйте ещё раз.");
      }
    }
  });

  seek.addEventListener("input", () => {
    audio.currentTime = seek.valueAsNumber;
    updateTime();
  });

  for (const event of [
    "loadedmetadata",
    "durationchange",
    "timeupdate",
    "seeked",
    "ended",
  ]) {
    audio.addEventListener(event, updateTime);
  }
  for (const event of ["play", "pause", "ended"]) {
    audio.addEventListener(event, updatePlayback);
  }
  for (const event of ["canplay", "playing", "pause", "ended"]) {
    audio.addEventListener(event, () => {
      if (!audio.error) showStatus();
    });
  }
  audio.addEventListener("waiting", () => {
    if (!audio.paused) showStatus("Аудиофрагмент загружается…");
  });
  audio.addEventListener("error", handleError);

  showStatus();
  audio.removeAttribute("controls");
  audio.classList.add("enhanced");
  play.disabled = false;
  if (audio.error) {
    handleError();
  } else {
    updateTime();
    updatePlayback();
  }
}

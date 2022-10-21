const $ = document.querySelector.bind(document);

const jsConfetti = new JSConfetti();

const record = $(".record");
const soundClips = $(".sound-clips");
const canvas = $(".visualizer");
const mainSection = $(".main-controls");
const statusWrapper = $("#statusWrapper");
const transcribedWrapper = $("#transcribedWrapper");
const transcribed = $("#transcribed");
const status = $("#status");
const progressBar = $("#progressBar");
const loaded_n_total = $("#loaded_n_total");

let audioCtx;
const canvasCtx = canvas.getContext("2d");

if (navigator.mediaDevices.getUserMedia) {
  console.log("getUserMedia supported.");

  const mimeType = [
    "audio/mp4",
    "audio/wav",
    "audio/webm",
    "audio/webm;codecs=opus",
  ].find((type) => MediaRecorder.isTypeSupported(type));

  console.log(`${mimeType} supported`);

  let chunks = [];

  let onSuccess = function (stream) {
    const mediaRecorder = new MediaRecorder(stream, {
      audioBitsPerSecond: 128000,
      mimeType: mimeType,
    });

    visualize(stream);

    record.onclick = () => {
      const isPlaying = record.getAttribute("isPlaying");

      if (isPlaying === "off") {
        mediaRecorder.start();

        record.setAttribute("isPlaying", "on");
        record.classList.add("recording");
        record.innerText = "Stop";

        statusWrapper.style.display = "block";
        transcribedWrapper.style.display = "none";
        transcribed.innerText = "";
        soundClips.replaceChildren();
        status.innerText = "Recording...";
        // console.log(mediaRecorder.state);
        // console.log("recorder started");
      } else {
        mediaRecorder.stop();

        record.setAttribute("isPlaying", "off");
        record.classList.remove("recording");
        record.innerText = "Record";

        // console.log(mediaRecorder.state);
        // console.log("recorder stopped");
        // mediaRecorder.requestData();
      }
    };

    mediaRecorder.onstop = function (e) {
      // console.log("data available after MediaRecorder.stop() called.");

      const clipContainer = document.createElement("article");
      const audio = document.createElement("audio");
      audio.setAttribute("controls", "");
      clipContainer.appendChild(audio);
      soundClips.appendChild(clipContainer);
      audio.controls = true;
      const blob = new Blob(chunks, { type: mimeType });

      uploadFile(blob);

      chunks = [];
      const audioURL = window.URL.createObjectURL(blob);
      audio.src = audioURL;
      console.log("recorder stopped");
    };

    mediaRecorder.ondataavailable = function (e) {
      chunks.push(e.data);
    };
  };

  let onError = function (err) {
    console.log("The following error occured: " + err);
  };

  navigator.mediaDevices.getUserMedia({ audio: true }).then(onSuccess, onError);
} else {
  alert("getUserMedia not supported on your browser!");
}

function visualize(stream) {
  console.log("visualize");

  if (!audioCtx) {
    audioCtx = new AudioContext();
  }

  const source = audioCtx.createMediaStreamSource(stream);
  const analyser = audioCtx.createAnalyser();
  analyser.fftSize = 2048;
  const bufferLength = analyser.frequencyBinCount;
  const dataArray = new Uint8Array(bufferLength);
  source.connect(analyser);
  //analyser.connect(audioCtx.destination);

  draw();

  function draw() {
    const WIDTH = canvas.width;
    const HEIGHT = canvas.height;

    requestAnimationFrame(draw);

    analyser.getByteTimeDomainData(dataArray);

    canvasCtx.fillStyle = "rgb(0, 0, 0)";
    canvasCtx.fillRect(0, 0, WIDTH, HEIGHT);

    canvasCtx.lineWidth = 5;
    canvasCtx.strokeStyle = "rgb(255, 255, 255)";

    canvasCtx.beginPath();

    const sliceWidth = (WIDTH * 2.0) / bufferLength;
    let x = 0;

    for (let i = 0; i < bufferLength; i++) {
      let v = dataArray[i] / 128.0;
      let y = (v * HEIGHT) / 2;

      if (i === 0) {
        canvasCtx.moveTo(x, y);
      } else {
        canvasCtx.lineTo(x, y);
      }

      x += sliceWidth;
    }

    canvasCtx.lineTo(canvas.width, canvas.height / 2);
    canvasCtx.stroke();
  }
}

/////

function uploadFile(file) {
  // alert(file.name+" | "+file.size+" | "+file.type);
  const formdata = new FormData();
  formdata.append("file", file);
  const postRequest = new XMLHttpRequest();
  postRequest.upload.addEventListener("progress", progressHandler, false);
  postRequest.addEventListener("load", completeHandler, false);
  postRequest.addEventListener("error", errorHandler, false);
  postRequest.addEventListener("abort", abortHandler, false);
  postRequest.open("POST", "/uploadAudio");
  postRequest.send(formdata);
}

function progressHandler(event) {
  const percent = Math.round((event.loaded / event.total) * 100);
  const loaded_n_total_text = `Uploaded ${event.loaded} bytes of ${event.total}`;
  loaded_n_total.innerText = loaded_n_total_text;
  progressBar.value = percent;
  status.innerText = percent + "% uploaded... please wait";
  transcribed.innerText = "";
  $("#buttons button").classList.add("transcribing");

  if (percent > 95) {
    loaded_n_total.style.display = "none";
    progressBar.style.display = "none";
    status.innerText = "Converting text now... please wait";
  } else {
    loaded_n_total.style.display = "block";
    progressBar.style.display = "block";
  }
}

function completeHandler(event) {
  const response = JSON.parse(event.target.responseText);
  console.log(event.target);

  statusWrapper.style.display = "none";
  transcribedWrapper.style.display = "block";
  status.innerText = "";
  $("#transcribed").innerText = response.message.trim();
  progressBar.value = 0;

  $("#buttons button").classList.remove("transcribing");

  if (response.error === false) {
    jsConfetti.addConfetti();
  }
}

function errorHandler(event) {
  status.innerText = "Upload Failed";
}

function abortHandler(event) {
  status.innerText = "Upload Aborted";
}

// -----

transcribed.addEventListener("touchend", (e) => {
  if (navigator.clipboard) {
    navigator.clipboard.writeText(transcribed.innerText).then(
      () => {
        // console.log("copied");
        const elCopy = $("#copy");
        elCopy.innerText = "✅ copied";

        setTimeout(() => {
          elCopy.innerText = "📋 copy";
        }, 3000);
      },
      () => {
        // console.log("copy error");
      }
    );
  }
});

// ------

window.onresize = () => {
  canvas.width = mainSection.offsetWidth;
};

window.onresize();

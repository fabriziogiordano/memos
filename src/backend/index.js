require("dotenv").config();

const fs = require("fs");
const util = require("util");
const path = require("path");

const { v4: uuidv4 } = require("uuid");

const { pipeline } = require("stream");
const pump = util.promisify(pipeline);
const exec = util.promisify(require("child_process").exec);

// Require the framework and instantiate it
const fastify = require("fastify")({
  logger: false,
  // https: {
  //   key: fs.readFileSync(path.join(__dirname, "..", "keys", "server.key")),
  //   cert: fs.readFileSync(path.join(__dirname, "..", "keys", "server.crt")),
  // },
});

fastify.register(require("@fastify/cors"), {});
fastify.register(require("@fastify/compress"), { global: true });
fastify.register(require("fastify-favicon"));
fastify.register(require("@fastify/multipart"));

fastify.get("/", async (request, reply) => {
  let d = new Date().toISOString();
  console.log(d);

  reply
    .code(200)
    .header("Content-Type", "application/json; charset=utf-8")
    .send({ data: `Nothing to see here ${d}` });
});

fastify.post("/upload", async (request, reply) => {
  const timeStamp = new Date().toISOString();
  console.log(timeStamp);

  const uniqueFileName = uuidv4();
  const mp3Path = `/root/audios/${uniqueFileName}.mp3`;
  const wavPath = `/root/audios/${uniqueFileName}.wav`;
  const txtPath = `/root/audios/${uniqueFileName}.wav.txt`;

  const parts = request.parts();
  const dataFields = {};

  // Loop
  for await (const part of parts) {
    if (part.file) {
      await pump(part.file, fs.createWriteStream(mp3Path));
    } else {
      dataFields[part.fieldname] = part.value;
    }
  }

  if (dataFields.token !== process.env.UPLOAD_SECRET) {
    return {
      message: ":: [[ TOKEN ERROR ]] ::",
      error: true,
    };
  }

  const converting = `ffmpeg -i ${mp3Path} -ar 16000 -ac 1 -c:a pcm_s16le ${wavPath} -y`;
  console.log("Converting to wav\n", converting);
  await exec(converting);

  const models = ["tiny", "base", "small"];

  const whispering = `/root/whisper.cpp/main -nt -m /root/whisper.cpp/models/ggml-${models[0]}.en.bin -otxt -f ${wavPath}`;
  console.log("Using whisper cpp\n", whispering);
  await exec(whispering);

  console.log("Read txt");
  const { stdout, stderr } = await exec(`cat ${txtPath}`);

  // Old implementation
  // await exec(`python3 transcribe.py ${filePath}`);
  // const { stdout, stderr } = await exec(`python3 transcribe.py ${filePath}`);

  console.log(stdout);

  reply.send({ message: stdout, error: false });
});

// Run the server!
const start = async () => {
  try {
    process.stdout.write("Starting server: ");
    await fastify.listen({ port: 3000, host: "0.0.0.0" });
    process.stdout.write("Started \n");
  } catch (err) {
    fastify.log.error(err);
    // eslint-disable-next-line no-undef
    process.exit(1);
  }
};
start();

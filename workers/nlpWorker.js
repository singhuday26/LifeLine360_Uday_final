const Communication = require('../models/Communication');
const AlertCandidate = require('../models/AlertCandidate');
const { runNlpPipeline } = require('../services/nlp/runPipeline');

function startNlpWorker() {
    // eslint-disable-next-line no-console
    console.log('✅ NLP Worker running…');

    setInterval(async () => {
        const pending = await Communication.find({ processed: false }).limit(5);

        for (const comm of pending) {
            const result = await runNlpPipeline(comm);

            await AlertCandidate.create({
                commId: comm._id,
                ...result
            });

            comm.processed = true;
            await comm.save();
        }
    }, 3000);
}

module.exports = {
    startNlpWorker
};

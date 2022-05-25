require('dotenv').config()
import argv, {Argv} from 'yargs'
import {
  startNewMeritsProcessing,
  startEditsProcessing,
} from '../coordinators'

argv
  .command('fetcher <cmd>', 'Run fetcher', async (yargs: Argv) => {
    yargs
    .command('schedule <cmd>', 'Run fetcher', async (yargs: Argv) => {
      yargs
        .command('new-merits', 'Manually start scheduling updates from new merits', {}, async () => {
          await startNewMeritsProcessing()
          process.exit()
        })
  
        .command('edits', 'Manually start scheduling updates from edits', {}, async () => {
          await startEditsProcessing()
          process.exit()
        })
    })
  })
  .demandCommand(1, 'You need at least one command before moving on!')
  .version('2.0')
  .help()
  .argv

process.on('unhandledRejection', (reason, p) =>
  console.log('Unhandled Rejection at: Promise ', p, reason)
)

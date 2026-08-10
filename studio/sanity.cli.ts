import { defineCliConfig } from 'sanity/cli'

export default defineCliConfig({
  studioHost: process.env.SANITY_STUDIO_HOST,
  api: {
    projectId: process.env.SANITY_STUDIO_PROJECT_ID,
    dataset: process.env.SANITY_STUDIO_DATASET,
  },
  deployment: {
    appId: process.env.SANITY_STUDIO_APP_ID,
    autoUpdates: true,
  }
})

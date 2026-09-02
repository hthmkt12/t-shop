import React from 'react'
import { Metadata } from 'next'

import { Gutter } from '../../_components/Gutter'
import { mergeOpenGraph } from '../../_utilities/mergeOpenGraph'
import { TrackOrderClient } from './TrackOrderClient'

export default async function TrackOrderPage() {
  return (
    <Gutter>
      <TrackOrderClient />
    </Gutter>
  )
}

export const metadata: Metadata = {
  title: 'Track Order | POD Live Status',
  description:
    'Track your print-on-demand custom product production and shipping status in real time.',
  openGraph: mergeOpenGraph({
    title: 'Track Order',
    url: '/track-order',
  }),
}

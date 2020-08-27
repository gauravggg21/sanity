import {Avatar} from 'part:@sanity/components/avatar'
// import {boolean, select} from 'part:@sanity/storybook/addons/knobs'
import Sanity from 'part:@sanity/storybook/addons/sanity'
import {CenteredContainer} from 'part:@sanity/storybook/components'
import React from 'react'

export function DefaultStory() {
  return (
    <CenteredContainer>
      <Sanity part="part:@sanity/components/avatar" propTables={[Avatar]}>
        <Avatar borderColor="#f00" label="asd" />
      </Sanity>
    </CenteredContainer>
  )
}

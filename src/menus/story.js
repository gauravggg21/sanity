import React from 'react'
import Menu from 'component:@sanity/components/menus/default'
import {storiesOf, action} from 'component:@sanity/storybook'
import SanityIcon from 'icon:@sanity/sanity-logo'

storiesOf('Menus')
.addWithInfo(
  'Menu',
  `
    Default menu
  `,
  () => {
    return (
      <div style={{
        width: '300px',
        position: 'relative'}}>
        <Menu
          onAction={action('Clicked item')}
          items={[
            {
              title: 'First item',
              index: '1'
            },
            {
              title: 'Second item',
              index: '1'
            },
            {
              title: 'Third item',
              index: '3'
            },
            {
              title: 'Extra item',
              index: '4',
              divider: true
            }
          ]}
          opened
        />
      </div>
    )
  },
  {
    propTables: [Menu],
    role: 'component:@sanity/components/menus/default'
  }
)
.addWithInfo(
  'Menu (with icons)',
  `
    ## Using icons
  `,
  () => {
    const items = [
      {
        title: 'First item',
        icon: SanityIcon,
        index: '1'
      },
      {
        title: 'Second item',
        icon: SanityIcon,
        index: '2'
      },
      {
        title: 'Third item',
        icon: SanityIcon,
        index: '3'
      },
      {
        kind: 'divider'
      },
      {
        title: 'Extra item',
        index: '4',
        icon: SanityIcon
      }
    ]
    return (
      <div style={{
        width: '300px',
        position: 'relative'}}>
        <Menu onAction={action('Clicked item')} items={items} opened />
      </div>
    )
  },
  {
    propTables: [Menu],
    role: 'component:@sanity/components/menus/default'
  }
)

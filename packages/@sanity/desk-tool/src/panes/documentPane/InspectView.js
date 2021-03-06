import PropTypes from 'prop-types'
import React from 'react'
import {combineLatest} from 'rxjs'
import {map} from 'rxjs/operators'
import JSONInspector from 'react-json-inspector'
import FullScreenDialog from 'part:@sanity/components/dialogs/fullscreen'
import TabList from 'part:@sanity/components/tabs/tab-list'
import Tab from 'part:@sanity/components/tabs/tab'
import TabPanel from 'part:@sanity/components/tabs/tab-panel'
import {isObject} from 'lodash'
import HLRU from 'hashlru'
import {withPropsStream} from 'react-props-stream'
import settings from '../../settings'
import DocTitle from '../../components/DocTitle'

import styles from './InspectView.css'

const lru = HLRU(1000)

function isExpanded(keyPath, value) {
  const cached = lru.get(keyPath)
  if (cached === undefined) {
    lru.set(keyPath, Array.isArray(value) || isObject(value))
    return isExpanded(keyPath, value)
  }
  return cached
}

function toggleExpanded(event) {
  const {path} = event
  const current = lru.get(path)
  if (current === undefined) {
    // something is wrong
    return
  }
  lru.set(path, !current)
}

function selectElement(element) {
  const sel = window.getSelection()
  sel.removeAllRanges()
  const range = document.createRange()
  range.selectNodeContents(element)
  sel.addRange(range)
}

function select(event) {
  selectElement(event.currentTarget)
}

function maybeSelectAll(event) {
  const selectAll = event.keyCode === 65 && (event.metaKey || event.ctrlKey)
  if (!selectAll) {
    return
  }
  event.preventDefault()
  selectElement(event.currentTarget)
}

const VIEW_MODE_PARSED = {id: 'parsed', title: 'Parsed'}
const VIEW_MODE_RAW = {id: 'raw', title: 'JSON'}
const VIEW_MODES = [VIEW_MODE_PARSED, VIEW_MODE_RAW]

const viewModeSettings = settings.forKey('inspect-view-preferred-view-mode')

function mapReceivedPropsToChildProps(props$) {
  const onViewModeChange = nextViewMode => viewModeSettings.set(nextViewMode.id)

  const viewModeSetting$ = viewModeSettings
    .listen('parsed')
    .pipe(map(id => VIEW_MODES.find(mode => mode.id === id)))

  return combineLatest(props$, viewModeSetting$).pipe(
    map(([props, viewMode]) => ({...props, viewMode, onViewModeChange}))
  )
}

function InspectView(props) {
  const {idPrefix, onClose, onViewModeChange, value, viewMode} = props

  // @todo: prefix with pane id
  const tabIdPrefix = `${idPrefix}_inspect_`

  return (
    <FullScreenDialog
      showHeader
      title={
        <span>
          Inspecting{' '}
          <em>
            <DocTitle document={value} />
          </em>
        </span>
      }
      onClose={onClose}
    >
      <div>
        <div className={styles.toolbar}>
          <TabList>
            <Tab
              aria-controls={`${tabIdPrefix}tabpanel`}
              id={`${tabIdPrefix}tab-${VIEW_MODE_PARSED.id}`}
              isActive={viewMode === VIEW_MODE_PARSED}
              label="Parsed"
              // eslint-disable-next-line react/jsx-no-bind
              onClick={() => onViewModeChange(VIEW_MODE_PARSED)}
            />
            <Tab
              aria-controls={`${tabIdPrefix}tabpanel`}
              id={`${tabIdPrefix}tab-${VIEW_MODE_PARSED.id}`}
              isActive={viewMode === VIEW_MODE_RAW}
              label="Raw JSON"
              // eslint-disable-next-line react/jsx-no-bind
              onClick={() => onViewModeChange(VIEW_MODE_RAW)}
            />
          </TabList>
        </div>

        <TabPanel
          aria-labelledby={`${tabIdPrefix}tab-${viewMode.id}`}
          className={styles.content}
          id={`${tabIdPrefix}tabpanel`}
          role="tabpanel"
        >
          {viewMode === VIEW_MODE_PARSED && (
            <div className={styles.jsonInspectorContainer}>
              <JSONInspector isExpanded={isExpanded} onClick={toggleExpanded} data={value} />
            </div>
          )}
          {viewMode === VIEW_MODE_RAW && (
            <pre
              className={styles.raw}
              tabIndex={0}
              onKeyDown={maybeSelectAll}
              onDoubleClick={select}
              onFocus={select}
            >
              {JSON.stringify(value, null, 2)}
            </pre>
          )}
        </TabPanel>
      </div>
    </FullScreenDialog>
  )
}

InspectView.propTypes = {
  idPrefix: PropTypes.string.isRequired,
  onClose: PropTypes.func,
  onViewModeChange: PropTypes.func.isRequired,
  // eslint-disable-next-line react/forbid-prop-types
  value: PropTypes.object,
  viewMode: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired
  }).isRequired
}

InspectView.defaultProps = {
  onClose: undefined,
  value: undefined
}

export default withPropsStream(mapReceivedPropsToChildProps, InspectView)

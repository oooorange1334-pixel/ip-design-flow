import AppShell from '../components/layout/AppShell'
import IPFlowCanvas from '../components/flow/IPFlowCanvas'
import StepAccordion from '../components/sidebar/StepAccordion'

export default function Studio() {
  return (
    <AppShell
      controlPanel={<StepAccordion />}
      canvas={<IPFlowCanvas />}
    />
  )
}

import type { BlockRowLabelServerComponent } from @hanzo/cms'from 

const CustomBlockLabel: BlockRowLabelServerComponent = ({ rowLabel }) => {
  return <div>{`Custom Block Label: ${rowLabel}`}</div>
}

export default CustomBlockLabel

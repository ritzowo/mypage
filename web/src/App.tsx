import PixelCursorTrail from './PixelCursorTrail'

const colors = [
  '#ffffff',
  '#000000',
  '#808080',
  '#ff0000',
  '#00ff00',
  '#0000ff',
  '#ffff00',
  '#00ffff',
  '#ff00ff',
  '#ff8800',
  '#8800ff',
  '#004400',
]

function App() {
  return (
    <>
      <PixelCursorTrail />
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 0,
          minHeight: '100svh',
        }}
      >
        {colors.map((c) => (
          <div key={c} style={{ background: c, minHeight: '33vh' }} />
        ))}
      </div>
    </>
  )
}

export default App

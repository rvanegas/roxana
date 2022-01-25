import React from 'react'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { DndProvider, useDrag, useDrop } from 'react-dnd'

function Box() {
  const [{isDragging, canDrag}, drag, dragPreview] = useDrag(() => ({
    // "type" is required. It is used by the "accept" specification of drop targets.
    type: 'BOX',
    // The collect function utilizes a "monitor" instance (see the Overview for what this is)
    // to pull important pieces of state from the DnD system.
    end() {
      console.log('ended')
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
      canDrag: monitor.canDrag(),
    })
  }))

  // return (
  //   <div ref={dragPreview} style={{ opacity: isDragging ? 0.5 : 1}}>
  //       {/* The drag ref marks this node as being the "pick-up" node */}
  //       <div ref={drag} >
  //         foo {canDrag ? 'bar' : 'X'}
  //       </div>
  //   </div>
  // )

  return isDragging ? (
    <div ref={dragPreview} style={{ opacity: isDragging ? 0.5 : 1}}>
      foo {canDrag ? 'Z' : 'W'}
    </div>
  ) : (
    <div ref={drag} >
      bar {canDrag ? 'Y' : 'X'}
    </div>
  )
}

function Bucket() {
  const [{isOver, canDrop}, drop] = useDrop(() => ({
    // The type (or types) to accept - strings or symbols
    accept: 'BOX',
    // Props to collect
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop()
    })
  }))

  return (
    <div
      ref={drop}
      style={{backgroundColor: isOver ? 'red' : 'white'}}
    >
      {canDrop ? 'Release to drop' : 'Drag a box here'}
    </div>
  )
}

export default function DragTest() {
  return (
    <DndProvider backend={HTML5Backend}>
      <Bucket/>
      <Box/>
    </DndProvider>
  )
}

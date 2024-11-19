
    const table = document.getElementById('boxTable');
    const addRowButton = document.getElementById('addRowButton');
    const undoButton = document.getElementById('undoButton');
    const redoButton = document.getElementById('redoButton');
    let boxCounter = 1000;
    const history = [];
    const redoStack = [];

    function getBoxColor(id) {
      const hue = id % 360;
      return `hsl(${hue}, 70%, 50%)`;
    }

    document.querySelectorAll('.box').forEach(box => {
      const id = parseInt(box.dataset.id, 10);
      box.style.backgroundColor = getBoxColor(id);
    });

    function enableDragAndDrop() {
      const boxes = document.querySelectorAll('.box');
      const cells = document.querySelectorAll('td');

      boxes.forEach(box => {
        box.addEventListener('dragstart', () => {
          box.classList.add('dragging');
          box.dataset.sourceCell = box.parentElement.dataset.cellId;
        });

        box.addEventListener('dragend', () => {
          box.classList.remove('dragging');
        });
      });

      cells.forEach(cell => {
        cell.addEventListener('dragover', e => e.preventDefault());

        cell.addEventListener('drop', () => {
          const draggedBox = document.querySelector('.dragging');
          const targetBox = cell.querySelector('.box');
          const sourceCell = draggedBox.parentElement;

          if (draggedBox && cell !== sourceCell) {
            history.push({
              type: 'move',
              from: sourceCell,
              to: cell,
              box: draggedBox,
              targetBox: targetBox,
            });

            redoStack.length = 0;
            undoButton.disabled = false;
            redoButton.disabled = true;

            if (targetBox) {
              sourceCell.appendChild(targetBox);
            }
            cell.appendChild(draggedBox);
          }
        });
      });
    }

    function cloneBox(box) {
      const clonedBox = document.createElement('div');
      clonedBox.className = 'box';
      clonedBox.draggable = true;
      clonedBox.dataset.id = box.dataset.id;
      clonedBox.textContent = box.textContent;
      clonedBox.style.backgroundColor = box.style.backgroundColor;
      return clonedBox;
    }

    function addRow() {
      const newRow = document.createElement('tr');
      const rowAction = { type: 'addRow', row: [] };

      for (let i = 0; i < 3; i++) {
        const newCell = document.createElement('td');
        const newBox = document.createElement('div');
        newBox.className = 'box';
        newBox.draggable = true;
        newBox.dataset.id = boxCounter;
        newBox.textContent = boxCounter;
        newBox.style.backgroundColor = getBoxColor(boxCounter);
        newCell.appendChild(newBox);
        newRow.appendChild(newCell);
        rowAction.row.push({ box: cloneBox(newBox), cell: newCell });
        boxCounter += 100;
      }

      table.appendChild(newRow);
      enableDragAndDrop();
      history.push(rowAction);
      redoStack.length = 0;
      undoButton.disabled = false;
      redoButton.disabled = true;
    }

    addRowButton.addEventListener('click', addRow);

    undoButton.addEventListener('click', () => {
      const lastAction = history.pop();
      if (!lastAction) return;
      redoStack.push(lastAction);

      if (lastAction.type === 'move') {
        lastAction.from.appendChild(lastAction.box);
        if (lastAction.targetBox) lastAction.to.appendChild(lastAction.targetBox);
      } else if (lastAction.type === 'addRow') {
        lastAction.row.forEach(({ cell }) => cell.remove());
      }

      undoButton.disabled = history.length === 0;
      redoButton.disabled = false;
    });

    redoButton.addEventListener('click', () => {
      const lastRedoAction = redoStack.pop();
      if (!lastRedoAction) return;
      history.push(lastRedoAction);

      if (lastRedoAction.type === 'move') {
        lastRedoAction.to.appendChild(lastRedoAction.box);
        if (lastRedoAction.targetBox) lastRedoAction.from.appendChild(lastRedoAction.targetBox);
      } else if (lastRedoAction.type === 'addRow') {
        const newRow = document.createElement('tr');
        lastRedoAction.row.forEach(({ box, cell }) => {
          const newCell = document.createElement('td');
          const clonedBox = cloneBox(box);
          newCell.appendChild(clonedBox);
          newRow.appendChild(newCell);
        });
        table.appendChild(newRow);
        enableDragAndDrop();
      }

      undoButton.disabled = false;
      redoButton.disabled = redoStack.length === 0;
    });

    enableDragAndDrop();
import Core from './Core';

class DOM_DragDropSorter {

    constructor(containers, items) {
        const me = this;

        this.events = new Core.Events(this);

        this.dropzones = [...containers];
        this.draggables = [...items];

        this.draggables.forEach((draggable) => {
            draggable.setAttribute("draggable", "true");
            draggable.addEventListener("dragstart", this.dragStart.bind(this));
            draggable.addEventListener("dragend", this.dragEnd.bind(this));
        });

        this.dropzones.forEach((zone) => {
            zone.classList.add("xo-drag-cnt")
            zone.addEventListener("dragover", (e) => {
                e.preventDefault();
                const afterElement = me.getDragAfterElement(zone, e.clientY);
                const draggable = document.querySelector(".xo-dragging");
                if (!afterElement) {
                    zone.appendChild(draggable);
                } else {
                    if (afterElement.previousSibling === draggable) return; // same position

                    zone.insertBefore(draggable, afterElement);
                }
                me.events.trigger("sorted", {
                    element: draggable,
                    before: afterElement
                })
            });
        });
    }

    dragStart(e) {
        e.target.closest("[draggable='true']").classList.add("xo-dragging");
    }

    dragEnd(e) {
        e.target.closest("[draggable='true']").classList.remove("xo-dragging");
    }

    getDragAfterElement(container, y) {
        const draggableElements = [
            ...container.querySelectorAll("[draggable='true']:not(.xo-dragging)")
        ];

        return draggableElements.reduce(
            (closest, child) => {
                const box = child.getBoundingClientRect();
                const offset = y - box.top - box.height / 2;

                if (offset < 0 && offset > closest.offset) {
                    return {
                        offset,
                        element: child
                    };
                } else {
                    return closest;
                }
            },
            { offset: Number.NEGATIVE_INFINITY }
        ).element;
    }

    stop() {
        this.draggables.forEach((draggable) => {
            draggable.removeAttribute("draggable");
            draggable.removeEventListener("dragstart", this.dragStart);
            draggable.removeEventListener("dragend", this.dragEnd);
        });

        this.dropzones.forEach((zone) => {
            zone.classList.remove("xo-drag-cnt")
        });
    }
}

export default DOM_DragDropSorter;
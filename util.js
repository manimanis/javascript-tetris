function createGrid(elem, n) {
    const grid = document.querySelector(elem);
    const divs = document.createDocumentFragment();
    for (let i = 0; i < n; i++) {
        const div = document.createElement('div');
        divs.appendChild(div)
    }
    grid.appendChild(divs);
}
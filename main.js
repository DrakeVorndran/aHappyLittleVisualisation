let imgData
let clicked = false



d3.csv("imgdata.csv").then(data => imgData = data)

d3.csv('elements-by-episode.csv').then(data => {
  const types = {

  }
  data.forEach(episode => {
    Object.keys(episode).forEach(key => {
      if (key !== "EPISODE" && key !== "TITLE") {
        if (key in types) {
          types[key] += parseInt(episode[key])
        }
        else {
          types[key] = parseInt(episode[key])
        }
      }
    })
  })
  const typePairs = d3.entries(types).sort((a, b) => b.value - a.value)
  const width = window.innerWidth
  const height = window.innerHeight

  let selected = new Set()


  const pack = data => d3.pack()	// Create a new pack layout
    .size([width, height])				// Set the size of the pack
    .padding(5)
    (d3.hierarchy({ children: data })
      .sum(d => d.value))

  const root = pack(typePairs);

  const svg = d3.select('body .vis svg')
    .style("width", "100vw")
    .style("height", "100vh")
    .attr("font-size", 10)
    .attr("font-family", "sans-serif")
    .attr("text-anchor", "middle")
  // .style('border', '1px solid')

  const leaf = svg.selectAll("g")
    .data(root.leaves())	// Get the data from the leaves of the root element
    .join("g")						// Join includes x and y properties that were added from pack()
    .attr("transform", d => `translate(${d.x + 1},${d.y + 1})`);

  const totalsTextBox = document.querySelector(".total-text")
  const totalsBox = document.querySelector(".totals")

  const resetButton = document.querySelector("button.reset")
  resetButton.onclick = () => {
    selected = new Set()
    update()
  }

  function addText({ type, total }) {
    const p = document.createElement("p")
    p.innerHTML = `${type}: ${total}`
    p.onclick = () => {
      selected.add(type)
      update()
    }
    totalsTextBox.appendChild(p)
  }

  function update() {

    d3.selectAll('svg g circle')
      .attr("fill", d => selected.has(d.data.key) ? "green" : "blue")
    let paintings = data.filter((painting) => [...selected].reduce((r, key) => painting[key] == 1 ? r : false, true))

    const paintingTotals = []
    Object.keys(types).forEach(type => {
      const paintingTotal = paintings.reduce((r, painting) => parseInt(painting[type]) + r, 0)
      paintingTotals.push({ total: paintingTotal, type })
    })

    paintingTotals.sort((a, b) => b.total - a.total)
    totalsTextBox.innerHTML = ""
    paintingTotals.forEach(painting => {
      if (painting.total > 0) {
        addText(painting)
      }
    })

    paintings = paintings.map(painting => painting.TITLE.slice(1, painting.TITLE.length - 1).toLowerCase())


    const paintingImgs = imgData.filter(img => paintings.includes(img.painting_title.toLowerCase()))


    const paintingsDiv = document.querySelector(".paintings")
    paintingsDiv.innerHTML = ''
    paintingImgs.forEach((painting) => {
      const p = document.createElement("img")
      p.src = painting.img_src
      p.title = painting.painting_title
      paintingsDiv.appendChild(p)
    })

  }

  leaf.append("circle")
    .attr("r", d => d.r)
    .attr("fill-opacity", 0.7)
    .attr("fill", d => d.selected ? "green" : "blue");

  leaf.append("clipPath")
    .append("use")

  leaf.append("text")
    .attr("clip-path", d => d.clipUid)
    .selectAll("tspan")
    .data(d => d.r > 30 ? `${d.data.key}`.split(/(?=[A-Z][^A-Z])/g) : "") //(${d.data.value})
    .join("tspan")
    .attr("x", 0)
    .attr("y", (d, i, nodes) => `${i - nodes.length / 2 + 0.8}em`)
    .text(d => d)

  leaf.on("click", (d) => {
    if (!clicked) {
      clicked = true
      showArrow()
    }
    if (selected.has(d.data.key)) {
      selected.delete(d.data.key)
      d.selected = false
    }
    else {
      selected.add(d.data.key)
      d.selected = true
    }
    update()

  })

  leaf.append("title")
    .text(d => d.data.key)


})

const arrow = document.querySelector(".arrow")
const body = document.querySelector("body")


function showArrow() {
  arrow.style.display = "flex"
  arrow.style.animationName = "float"
  // window.setTimeout(() => {
  //   arrow.style.display = "none"
  // }, 5000)
}


window.onscroll = () => {
  if (window.scrollY > window.innerHeight * .5) {
    arrow.style.opacity = "0"
  }
}




// demo_ui_app.rjs
// UI demo: sortable/filterable project table + tag-based gallery
/*!
 * RJS - Revolution JavaScript
 * © Peacedeveloper. All rights reserved.
 * https://peacedeveloper1.github.io/rjs/
 * peacedeveloper@gmail.com
 * This file is part of the RJS language and loader.
 * Unauthorized copying, modification, or distribution is prohibited.
 */
 
// ---------- Data ----------

projects :: [<
  id 	name 					owner 	status 		priority 	category 	updated
  1 	"Landing Page Revamp" 	Alice 	Active     	High   		Frontend   	2025-11-10
  2 	"Subscriber Analytics" 	Noel  	Active     	Medium 		Analytics  	2025-11-12
  3 	"Billing Webhook"      	Kai   	Paused     	High   		Backend    	2025-11-06
  4 	"Campaign Console"     	Mina  	Completed  	Low    		Marketing  	2025-11-01
  5 	"Design System v3"     	Alice 	Active     	High   		Design     	2025-11-15
  6 	"API Key Manager"      	Jin   	Completed  	Medium 		"Dev tools"	2025-11-03
  7 	"Churn Radar"          	Noel  	Paused     	Medium 		Analytics  	2025-11-08
  8 	"Checkout A/B Test"    	Mina  	Active     	Low    		Growth     	2025-11-09
>];

galleryItems :: [<
  id title                        meta                                tags                 thumb
  g1 "KPI Analytics Overview"     "Time-series, segments, filters"    analytics            KA
  g2 "Marketing Campaign Board"   "Columns, cards, kanban"            marketing            MC
  g3 "Billing Plan Selector"      "Toggle monthly/yearly, addons"     billing              BP
  g4 "Feature Flag Console"       "Environment switch, rollout"       devtools             FF
  g5 "Event Stream Monitor"       "Live tail, filters, search"        analytics+devtools   ES
  g6 "Invoice History"            "Table, status pill, export"        billing+analytics    IH
>];


// ---------- State ----------
currentSortKey      := "name"
currentSortDir      := "asc"
currentStatusFilter := "all"
currentSearch       := ""     //
activeGalleryTag    := "all"


// ---------- Small helpers ----------

fn qs(sel:String) = document.querySelector(sel)
fn qsa(sel:String) = Array.from(document.querySelectorAll(sel))

fn compareByKey(a, b, key, dir)
  va := ""
  vb := ""

  if (a && a[key] != null)
    va = a[key].toString().toLowerCase()
  end

  if (b && b[key] != null)
    vb = b[key].toString().toLowerCase()
  end

  if (va < vb) -> return dir === "asc" ? -1 : 1
  if (va > vb) -> return dir === "asc" ?  1 : -1
  return 0
end

fn matchesStatus(p)
  if (currentStatusFilter === "all") -> return true
  return p.status === currentStatusFilter
end

fn matchesSearch(p)
  if (!currentSearch || currentSearch.trim().length === 0) -> return true

  kw := currentSearch.trim().toLowerCase()

  if (p.name.toLowerCase().includes(kw))     -> return true
  if (p.owner.toLowerCase().includes(kw))    -> return true
  if (p.category.toLowerCase().includes(kw)) -> return true

  return false
end

fn compareProjects(a, b)
  return compareByKey(a, b, currentSortKey, currentSortDir)
end

fn getSortedProjects()
  result := []
  len := projects.length
  i := 0

  for (i = 0; i < len; i++)
    p := projects[i]
    if (matchesStatus(p) && matchesSearch(p)) -> result.push(p)
  end

  // sort in-place
  result.sort(compareProjects)
  return result
end

// ---------- Project table rendering ----------

fn renderProjects()
  tbody := qs("#projectTableBody")
  if (!tbody) -> return

  rows := []
  list := getSortedProjects()
  len := list.length
  i := 0

  for (i = 0; i < len; i++)
    p := list[i]

    statusClass := "status-pill"
    if (p.status === "Active")
      statusClass = "status-pill status-active"
    else if (p.status === "Paused")
      statusClass = "status-pill status-paused"
    else if (p.status === "Completed")
      statusClass = "status-pill status-completed"
    end

    priorityClass := ""
    if (p.priority === "High")
      priorityClass = "priority-high"
    else if (p.priority === "Low")
      priorityClass = "priority-low"
    end

    rowHtml := `
      <tr>
        <td class="cell-main">
          <div class="cell-title">${p.name}</div>
          <div class="cell-sub">${p.category}</div>
        </td>
        <td>${p.owner}</td>
        <td><span class="${statusClass}">${p.status}</span></td>
        <td class="${priorityClass}">${p.priority}</td>
        <td>${p.updated}</td>
      </tr>
    `
    rows.push(rowHtml)
  end

  tbody.innerHTML = rows.join("")
end

fn updateSortIndicators()
  headers := qsa("th[data-sort-key]")
  len := headers.length
  i := 0

  for (i = 0; i < len; i++)
    th := headers[i]
    key := th.dataset.sortKey
    span := th.querySelector(".sort-indicator")

    th.classList.remove("is-sorted-asc", "is-sorted-desc")
    if (span) -> span.textContent = ""

    if (key === currentSortKey)
      dirClass := currentSortDir === "asc" ? "is-sorted-asc" : "is-sorted-desc"
      arrow := currentSortDir === "asc" ? "▲" : "▼"
      th.classList.add(dirClass)
      if (span) -> span.textContent = arrow
    end
  end
end

fn updateStatusFilterButtons()
  buttons := qsa("[data-status-filter]")
  len := buttons.length
  i := 0

  for (i = 0; i < len; i++)
    btn := buttons[i]
    value := btn.dataset.statusFilter || "all"
    if (value === currentStatusFilter)
      btn.classList.add("is-active")
    else
      btn.classList.remove("is-active")
    end
  end
end

// ---------- Gallery rendering ----------

fn renderGallery()
  container := qs("#galleryGrid")
  if (!container) -> return

  visible := []
  len := galleryItems.length
  i := 0

  for (i = 0; i < len; i++)
    item := galleryItems[i]
    show := false

    if (activeGalleryTag === "all")
      show = true
    else if (item.tags && item.tags.indexOf(activeGalleryTag) >= 0)
      show = true
    end

    if (show) -> visible.push(item)
  end

  cards := []
  vlen := visible.length
  j := 0

  for (j = 0; j < vlen; j++)
    it := visible[j]
    tagsHtml := ""

    if (it.tags)
      tlen := it.tags.length
      k := 0
      for (k = 0; k < tlen; k++)
        tag := it.tags[k]
        tagsHtml += `<span class="tag-pill">${tag}</span>`
      end
    end

    cardHtml := `
      <article class="gallery-card">
        <div class="gallery-thumb">${it.thumb}</div>
        <h3>${it.title}</h3>
        <div class="gallery-meta">${it.meta}</div>
        <div class="gallery-tags">${tagsHtml}</div>
      </article>
    `
    cards.push(cardHtml)
  end

  container.innerHTML = cards.join("")
end

fn updateGalleryButtons()
  tagButtons := qsa("[data-gallery-tag]")
  len := tagButtons.length
  i := 0

  for (i = 0; i < len; i++)
    btn := tagButtons[i]
    value := btn.dataset.galleryTag || "all"
    if (value === activeGalleryTag)
      btn.classList.add("is-active")
    else
      btn.classList.remove("is-active")
    end
  end
end

// ---------- Event handlers ----------

fn onSearchInput(evt)
  target := evt.target || evt.currentTarget
  if (!target) -> return
  currentSearch = target.value || ""
  renderProjects()
end

fn onStatusButtonClick(evt)
  target := evt.currentTarget || evt.target
  if (!target) -> return
  filter := target.dataset.statusFilter || "all"
  currentStatusFilter = filter
  updateStatusFilterButtons()
  renderProjects()
end

fn onHeaderClick(evt)
  th := evt.currentTarget || evt.target
  if (!th) -> return
  key := th.dataset.sortKey
  if (!key) -> return

  // toggle sort
  if (currentSortKey === key && currentSortDir === "asc")
    currentSortDir = "desc"
  else if (currentSortKey === key && currentSortDir === "desc")
    currentSortDir = "asc"
  else
    currentSortKey = key
    currentSortDir = "asc"
  end

  renderProjects()
  updateSortIndicators()
end

fn onGalleryTagClick(evt)
  btn := evt.currentTarget || evt.target
  if (!btn) -> return
  tag := btn.dataset.galleryTag || "all"
  activeGalleryTag = tag
  updateGalleryButtons()
  renderGallery()
end

fn wireProjectTableControls()
  searchInput := qs("#projectSearch")
  if (!searchInput) -> return

  statusButtons := qsa("[data-status-filter]")
  headerCells := qsa("th[data-sort-key]")

  searchInput.addEventListener("input", onSearchInput)

  len := statusButtons.length
  i := 0
  for (i = 0; i < len; i++)
    btn := statusButtons[i]
    btn.addEventListener("click", onStatusButtonClick)
  end

  hlen := headerCells.length
  j := 0
  for (j = 0; j < hlen; j++)
    th := headerCells[j]
    th.addEventListener("click", onHeaderClick)
  end
end

fn wireGalleryControls()
  tagButtons := qsa("[data-gallery-tag]")
  len := tagButtons.length
  i := 0
  for (i = 0; i < len; i++)
    btn := tagButtons[i]
    btn.addEventListener("click", onGalleryTagClick)
  end
end

// ---------- Init ----------

fn init()
  wireProjectTableControls()
  wireGalleryControls()
  renderProjects()
  updateSortIndicators()
  renderGallery()
end

init()

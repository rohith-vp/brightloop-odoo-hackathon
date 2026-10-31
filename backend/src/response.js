// Success shapes from docs/api.md: { data } for one item, { data, meta } for lists.
export function sendData(res, data, status = 200) {
  res.status(status).json({ data });
}

export function sendList(res, items, { page, page_size, total }) {
  res.status(200).json({ data: items, meta: { page, page_size, total } });
}

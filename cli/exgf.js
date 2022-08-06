const emitter = mitt()

const elements = document.querySelectorAll('[exgf]')
elements.forEach(element => {
  bindMethods(element)
  bindDatas(element)
})

function bindMethods(el) {
  const attrs = [...el.attributes]
  const events = attrs.filter(attr => {
    return attr.localName.startsWith('@')
  }).map(x => x.localName)

  events.forEach(dashedEvent => {
    const bind = el.getAttribute(dashedEvent)
    const event = dashToUpper(dashedEvent).slice(1)
    el[`on${event}`] = methods[bind]
  });
}

function bindDatas(el) {
  const attrs = [...el.attributes]
  const events = attrs.filter(attr => {
    return attr.localName.startsWith(':')
  }).map(x => x.localName)

  events.forEach(dashedEvent => {
    const bind = el.getAttribute(dashedEvent)
    const event = dashToUpper(dashedEvent).slice(1)
    emitter.on('data-changed-' + bind, () => {
      el[event] = data[bind]
    })

  })
}

function dashToUpper(dashedAttribute) {
  const dashPosition = dashedAttribute.indexOf('--')
  if (dashPosition === -1)
    return dashedAttribute

  const charAfterDashes = dashedAttribute[dashPosition + 2]
  return dashedAttribute.replace(`--${charAfterDashes}`, charAfterDashes.toUpperCase())
}

function init() {
  const _data = { ...data }

  for (const key in data) {
    data[key] = null;

    Object.defineProperty(data, key, {
      get() {
        return _data[key]
      },
      set(e) {
        _data[key] = e
        emitter.emit('data-changed-' + key)
      }
    })
  }
}
init()
// import TableFilter from "tablefilter"
// const TableFilter = require('tablefilter');




let input = document.createElement('input');
input.type = 'file';
input.onchange = e => {
  let file = e.target.files[0]
  console.log(file)
  let reader = new FileReader();
  reader.readAsText(file, 'UTF-8')
  console.log(reader)
  reader.onload = readerEvent => {
    let result = readerEvent.target.result
    const re = /\[DEBUG\] mdm_search_packet\(\) => FROM: (\d+) TO: (\d+)(?:\n|\r\n)\(.*\) \[DEBUG\] mdm_search_packet\(\) => ([-]r[\w\s-]+)/gm
    let match;
    const s = result.toString()

    let entries = []

    while ((match = re.exec(s)) !== null) {
      const from = match[1]
      const to = match[2]
      const rString = match[3]

      // parse rstring
      // '-r4145000706038112151 -112\r\n'
      const parts = rString.split('-r')[1].split('\r\n')[0].split(' ')
      const payload = parts[0]
      const rssi = parseInt(parts[1])
      const src = parseInt(payload.slice(0, 2), 16) & 0x3F
      const dst = ((parseInt(payload.slice(0, 2), 16) & 0xC0) >> 6) | ((parseInt(payload.slice(2, 4), 16) & 0x0F) << 2)
      const ttl = parseInt(payload.slice(2, 4), 16) & 0x10 ? 1 : 0
      const cmd = (parseInt(payload.slice(2, 4), 16) & 0xE0) >> 5
      const dataCount = payload.length - 1
      const errors = parseInt(payload.slice(payload.length - 1))
      let hrd = []
      for (let i = 4; i < dataCount - 1; i += 2) {
        hrd.push(`0x${parseInt(payload.slice(i, i + 2), 16).toString(16).padStart(2, "0")}`)
      }
      const cmdList = {
        '0': 'CMD_ENUM_REQ',
        '1': 'CMD_ENUM_RESP',
        '2': 'CMD_STATUS_REQ',
        '3': 'CMD_STATUS_RESP',
        '4': 'CMD_ALARM',
        '5': 'CMD_CANCEL',
        '6': 'CMD_SB_ACK',
      }
      const hrcmd = cmdList[cmd.toString()]
      entries.push({from: from, to: to, rString: rString, hrd: hrd, rssi: rssi, src: src, dst: dst, ttl: ttl, cmd: cmd, errors: errors, hrcmd: hrcmd})
    }
    console.log(entries)
    const table = document.querySelector('.my-table')
    let thead = document.createElement('thead')
    const headers = ['SRC', 'DST', 'RSSI', 'CMD', 'HR_CMD', 'TTL', 'ERRORS', 'RSTRING', 'HR_D']
    for (let header of headers) {
      thead.appendChild(document.createElement("th"))
          .appendChild(document.createTextNode(header))
    }
    table.appendChild(thead)
    for (let item of entries) {
      const row = table.insertRow(-1)
      row.insertCell(0).textContent = item['src']
      row.insertCell(1).textContent = item['dst']
      row.insertCell(2).textContent = item['rssi']
      row.insertCell(3).textContent = item['cmd']
      row.insertCell(4).textContent = item['hrcmd']
      row.insertCell(5).textContent = item['ttl']
      row.insertCell(6).textContent = item['errors']
      row.insertCell(7).textContent = item['rString']
      row.insertCell(8).textContent = item['hrd']
    }
    let tf = new TableFilter(document.querySelector('.my-table'), {
      base_path: './node_modules/tablefilter/dist/tablefilter/'
    });

    tf.init();
  }
}

const onFileClick = () => input.click()

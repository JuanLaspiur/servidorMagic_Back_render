class MoveFileService {
  async moveFile (file) {
    const Helpers = use('Helpers')
    const path = require('path')
    file.clientName = 'UploadExcel.xlsx'
    const filePath = `${path.resolve(`./tmp/uploads/`)}/${file.clientName}`
    await file.move(Helpers.tmpPath('uploads'), { name: file.clientName, overwrite: true })
    return filePath
  }
}

module.exports = new MoveFileService();

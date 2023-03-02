const multer=require('multer')
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null,'public/product-images')
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
      cb(null, file.fieldname + '-' + uniqueSuffix+'.jpg')
    }
  })
  
  const upload = multer({ storage: storage })
  const multiUpload = upload.fields([{ name: 'Image', maxCount: 1 }, { name: 'subImage', maxCount: 4 }])
  module.exports=multiUpload;
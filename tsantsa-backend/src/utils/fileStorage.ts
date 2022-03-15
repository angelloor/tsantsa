import multer from 'multer';

const _storageImageAvatar = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, './');
	},
	filename: function (req, file, cb) {
		cb(null, file.fieldname + '.jpg');
	},
});

const _storageFileStore = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, './');
	},
	filename: function (req, file, cb) {
		cb(null, file.originalname);
	},
});

export const uploadAvatar = multer({ storage: _storageImageAvatar });
export const uploadFile = multer({ storage: _storageFileStore });

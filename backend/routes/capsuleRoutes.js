const express=require("express");
const {CreateCapsule,UsersCapsules,ViewCapsule,DeleteCapsule,EditCapsule}=require('../controllers//CapsuleController');
const router = express.Router();
const auth=require('../middlewares/Auth');
const upload=require("../middlewares/Upload");


router.post("/create-capsule", auth, upload.single("media"), CreateCapsule);
router.get('/user-capsules',auth,UsersCapsules);
router.get('/view-capsule/:id',auth,ViewCapsule);
router.delete('/delete-capsule',auth,DeleteCapsule);
router.put('/edit-capsule',EditCapsule);

module.exports = router;

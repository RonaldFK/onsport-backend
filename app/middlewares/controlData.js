import { User } from '../models/User.js';
import { Activity } from '../models/Activity.js';
import { unlink } from 'node:fs';
export const controlUnique = {
  async uniqueUser(req, res, next) {
    const { login, password } = req.body;

    if (login === undefined || password === undefined) {
      return res.status(400).json({ Error: 'Formulaire non complet' });
    }
    const dataToControl = await User.findOne({ where: { login: login } });

    if (dataToControl?.dataValues) {
      return res.status(400).json({ Error: 'Utilisateur existe déjà' });
    }
    next();
  },
  async loginNotEmpty(req, res, next) {
    const { login, password } = req.body;

    if (login === undefined || password === undefined) {
      return res.status(400).json({ Error: 'Formulaire non complet' });
    }
    next();
  },
  async uniqueActivity(req, res, next) {
    let json;
    if (req.body?.json) {
      json = JSON.parse(req.body?.json);
    }

    if (
      json?.title === undefined ||
      json?.sport_id === undefined ||
      json?.user_id === undefined
    ) {
      if (req?.file?.filename)
        unlink(`app/photos/${req?.file?.filename}`, (err) => {
          if (err) throw err;
          console.log('path/file.txt was deleted');
        });
      return res.status(400).json({ Error: 'Formulaire non complet' });
    }

    const dataToControl = await Activity.findOne({
      where: { title: json.title },
    });
    console.log('RESULT', dataToControl.dataValues);
    if (dataToControl?.dataValues && req?.filename != undefined) {
      unlink(`app/photos/${req.file?.filename}`, (err) => {
        if (err) throw err;
        console.log('path/file.txt was deleted');
      });
    }
    if (dataToControl?.dataValues) {
      return res.status(400).json({ Error: "Nom d'activité déjà existant" });
    }

    next();
  },
};

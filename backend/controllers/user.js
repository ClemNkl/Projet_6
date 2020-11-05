const crypto = require('crypto');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const User = require('../models/User');

//Algorithme de cryptage email
const algorithm = 'aes256';
//Clé de chiffrement
const password = 'l5JmP+G0/1zB%;r8B8?2?2pcqGcL^3';

exports.signup = (req, res, next) => {
  const cipher = crypto.createCipher(algorithm,password);
  let crypted = cipher.update(req.body.email,'utf8','hex');
  crypted += cipher.final('hex');
  bcrypt.hash(req.body.password, 10)
    .then(hash => {
      const user = new User({
        email: crypted,
        password: hash
      });
      user.save()
        .then(() => res.status(201).json({ message: 'Utilisateur créé !' }))
        .catch(error => res.status(400).json({ error }));
    })
    .catch(error => res.status(500).json({ error }));
};

exports.login = (req, res, next) => {
  const cipher = crypto.createCipher(algorithm,password);
  let crypted = cipher.update(req.body.email,'utf8','hex');
  crypted += cipher.final('hex');
  User.findOne({ email: crypted })
    .then(user => {
      if (!user) {
        return res.status(401).json({ error: 'Utilisateur non trouvé !' });
      }
      bcrypt.compare(req.body.password, user.password)
        .then(valid => {
          if (!valid) {
            return res.status(401).json({ error: 'Mot de passe incorrect !' });
          }
          res.status(200).json({
            userId: user._id,
            token: jwt.sign(
              { userId: user._id },
              'RANDOM_TOKEN_SECRET',
              { expiresIn: '24h' }
            )
          });
        })
        .catch(error => res.status(500).json({ error }));
    })
    .catch(error => res.status(500).json({ error }));
};

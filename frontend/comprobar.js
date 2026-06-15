import b from 'bcryptjs';

const contrasenaPlana = 'test$2026';
const hashGuardado = '$2b$10$Xgw9Dvn0Omkx7LXzE0ov0OtjneNptPokWpbQ5W04ickdwbIgPlt2q';

b.compare(contrasenaPlana, hashGuardado).then((coincide) => {
    console.log('¿La contraseña es correcta?:', coincide);
});


// Fazer requests para poder pegar as imagens de links
const axios = require("axios");

// Sharp para sobrepor imagens
const sharp = require("sharp");
// Jimp para colocar o texto
const Jimp = require("jimp");

const { AttachmentBuilder } = require("discord.js");

async function displayDistrict(faction, district, players) {
    // Carregamos a imagem
    const image = await Jimp.read(`images/templates/template_${faction}.png`);
    
    // Inserimos o texto do Distrito
    await image.print(
        await Jimp.loadFont(Jimp.FONT_SANS_64_WHITE),
        0, 50, // Posições iniciais para depois centralizar 
        {
            text: `Distrito ${district}`,
            alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER,
            alignmentY: Jimp.VERTICAL_ALIGN_MIDDLE
        },
        image.getWidth(), 100 // Posições finais fazendo com que centralize entre 0 - image.getWidth() e 50 e 100
    ).quality(100);

    await image.print(
        await Jimp.loadFont(Jimp.FONT_SANS_32_WHITE),
        50, 50,
        {
            text: `Facção: ${faction}`,
            alignmentY: Jimp.VERTICAL_ALIGN_MIDDLE
        },
        image.getWidth(), 100
    ).quality(100);

    // Carregar como sharp o background
    const backgroundBuffer = await image.getBufferAsync(Jimp.MIME_JPEG);
    const background = await sharp(backgroundBuffer).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    const { data: bgData, info: bgInfo } = background;
    
    for (index in players) {
        const player = players[index];

        const overlayBuffer = (await axios({ url: player.avatar, responseType: "arraybuffer" })).data;
        const overlay = await sharp(overlayBuffer).ensureAlpha().resize({ width: 400, height: 400 }).raw().toBuffer({ resolveWithObject: true });
        const { data: ovData, info: ovInfo } = overlay;

        for (let row = 0; row < ovInfo.height; row++) {
            for (let col = 0; col < ovInfo.width; col++) {
                let width = 283;
                if (index != 1) width = 959;

                const ovIdx = (row * ovInfo.width + col) * 4;
                const bgIdx = ((row + 171) * bgInfo.width + (col + width)) * 4; // Caso seja a primeira foto começa a partir do pixel 283, se não é do 957

                if (bgData[bgIdx] == 255 && bgData[bgIdx + 1] == 255 && bgData[bgIdx + 2] == 255) {
                    bgData[bgIdx] = ovData[ovIdx];
                    bgData[bgIdx + 1] = ovData[ovIdx + 1];
                    bgData[bgIdx + 2] = ovData[ovIdx + 2];
                    bgData[bgIdx + 3] = ovData[ovIdx + 3];
                }
            }
        }
    }

    const buffer = await sharp(bgData, { raw: { width: bgInfo.width, height: bgInfo.height, channels: 4 }}).jpeg().toBuffer();
    const attachment = new AttachmentBuilder(buffer, { name: `distrito_${district}.jpg` });

    return attachment;

}

exports.displayDistrict = displayDistrict;
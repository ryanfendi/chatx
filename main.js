const socket = io("https://c62ece58-3908-4b24-8998-bbb028287830-00-13wz9yilxc66m.pike.replit.dev");

let playerId;
let players = {};
let avatarType = localStorage.getItem("avatarType") || "pria";

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: "#222",
  physics: {
    default: "arcade",
    arcade: { gravity: { y: 0 } }
  },
  scene: {
    preload,
    create,
    update
  }
};

const game = new Phaser.Game(config);

function preload() {
  this.load.image("pria", "https://i.imgur.com/uQaaapA.png");
  this.load.image("wanita", "https://i.imgur.com/bMolfpy.png");
}

function create() {
  this.chatBubbles = {};

  socket.on("init", (id) => {
    playerId = id;
    socket.emit("avatarType", avatarType); // ⬅️ Kirim avatarType setelah dapat id
  });

  socket.on("state", (serverPlayers) => {
    // Hapus player yang sudah keluar
    for (const id in players) {
      if (!serverPlayers[id]) {
        players[id].avatar.destroy();
        players[id].bubble.destroy();
        delete players[id];
      }
    }

    for (const id in serverPlayers) {
      const data = serverPlayers[id];

      if (!players[id]) {
        const avatarImg = data.avatarType || "pria";
        const avatar = this.add.sprite(data.x, data.y, avatarImg).setScale(2);
        const bubble = this.add.text(data.x, data.y - 40, "", {
          font: "16px Arial",
          fill: "#fff",
          backgroundColor: "#000",
          padding: { x: 5, y: 2 }
        }).setOrigin(0.5).setVisible(false);

        players[id] = { avatar, bubble };
      } else {
        players[id].avatar.x = data.x;
        players[id].avatar.y = data.y;
        players[id].bubble.x = data.x;
        players[id].bubble.y = data.y - 40;
      }
    }
  });

  socket.on("chat", ({ id, msg }) => {
    const player = players[id];
    if (player) {
      player.bubble.setText(msg).setVisible(true);
      this.time.delayedCall(3000, () => {
        player.bubble.setVisible(false);
      });
    }
  });

  this.cursors = this.input.keyboard.createCursorKeys();

  const form = document.getElementById("chatForm");
  const input = document.getElementById("chatInput");

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const msg = input.value.trim();
    if (msg) {
      socket.emit("chat", msg);
      input.value = "";
    }
  });
}

function update() {
  const player = players[playerId];
  if (!player) return;

  let moved = false;
  if (this.cursors.left.isDown) {
    player.avatar.x -= 3;
    moved = true;
  } else if (this.cursors.right.isDown) {
    player.avatar.x += 3;
    moved = true;
  }

  if (moved) {
    socket.emit("move", {
      x: player.avatar.x,
      y: player.avatar.y

      this.input.keyboard.on("keydown", (event) => {
  const player = players[playerId];
  if (!player) return;

  if (event.key === "1") {
    // Lompat (naik lalu turun)
    player.avatar.y -= 50;
    setTimeout(() => {
      player.avatar.y += 50;
    }, 300);
  }

  if (event.key === "2" && inventory.includes("emote_wave")) {
    player.avatar.setAngle(15);
    setTimeout(() => player.avatar.setAngle(0), 300);
  }

  if (event.key === "3" && inventory.includes("emote_dance")) {
    let i = 0;
    const interval = setInterval(() => {
      player.avatar.setFlipX(i % 2 === 0);
      i++;
      if (i > 5) {
        clearInterval(interval);
        player.avatar.setFlipX(false);
      }
    }, 100);
  }
});

   
  }
}

import Phaser from 'phaser'
import type { Player } from '../models/player.ts'
import playerUrl from '../assets/PlayerV2.png'
import backgroundUrl from '../assets/Background/Background01.png'
import foregroundUrl from '../assets/Background/Foreground1.png'
import panelUrl from '../assets/FondoPapel.png'
import confirmUrl from '../assets/Botones/BotonConfirmar01.png'
import confirmHoverUrl from '../assets/Botones/BotonConfirmar01Hover.png'
import cancelUrl from '../assets/Botones/BotonCancelar01.png'
import cancelHoverUrl from '../assets/Botones/BotonCancelar01Hover.png'
import clickUrl from '../assets/Audio/Boton_1.mp3'
import gameplayIntroUrl from '../assets/Audio/Tema_Gameplay_01.mp3'
import gameplayLoopUrl from '../assets/Audio/Tema_Gameplay_02.mp3'
import suspectUrl from '../assets/Audio/Mouse_sobre_sospechoso.mp3'

// Rutas que funcionan igual en desarrollo y en el build
const maskUrls = import.meta.glob<string>('../assets/Masks/mask*.png', { eager: true, query: '?url', import: 'default' })
const MASKS = Object.entries(maskUrls).map(([path, url]) => ({ key: path.match(/(mask\d+)\.png$/)![1]!, url }))

export class GameplayScene extends Phaser.Scene {
  players: Player[]
  playerContainers = new Map<string, Phaser.GameObjects.Container>()
  maskSprites = new Map<string, Phaser.GameObjects.Sprite>()
  modalContainer?: Phaser.GameObjects.Container
  modalOpen = false

  sounds!: {
    click: Phaser.Sound.BaseSound
    juego1: Phaser.Sound.BaseSound
    juego2: Phaser.Sound.BaseSound
    sospechoso: Phaser.Sound.BaseSound
  }

  constructor(players: Player[]) {
    super('GameplayScene')
    this.players = players
  }

  preload() {
    this.load.image('player', playerUrl)
    this.load.image('background', backgroundUrl)
    this.load.image('foreground', foregroundUrl)
    this.load.image('modal-panel', panelUrl)
    this.load.image('btn-confirm', confirmUrl)
    this.load.image('btn-confirm-hover', confirmHoverUrl)
    this.load.image('btn-cancel', cancelUrl)
    this.load.image('btn-cancel-hover', cancelHoverUrl)

    this.load.audio('click', clickUrl)
    this.load.audio('juego1', gameplayIntroUrl)
    this.load.audio('juego2', gameplayLoopUrl)
    this.load.audio('sospechoso', suspectUrl)

    for (const mask of MASKS) this.load.image(mask.key, mask.url)
  }

  create() {
    const bg = this.add.image(640, 360, 'background');

    this.sounds = {
      click: this.sound.add('click', { loop: false, volume: 0.75 }),
      juego1: this.sound.add('juego1', { loop: false, volume: 0.5 }),
      juego2: this.sound.add('juego2', { loop: true, volume: 0.5 }),
      sospechoso: this.sound.add('sospechoso', { loop: false, volume: 1 })
    }
    // El tema arranca una vez y sigue con su versión en bucle
    this.sounds.juego1.once('complete', () => this.sounds.juego2.play())
    this.sounds.juego1.play()

    const scaleX = this.scale.width / bg.width
    const scaleY = this.scale.height / bg.height

    const scale = Math.max(scaleX, scaleY)
    bg.setScale(scale)

    const MAX_VISIBLE = 6
    const visiblePlayers = this.players.slice(0, MAX_VISIBLE)

    const spriteWidth = 125
    const spriteHeight = 250
    const spacing = 25

    const totalWidth =
      visiblePlayers.length * spriteWidth +
      (visiblePlayers.length - 1) * spacing

    const startX = (this.scale.width - totalWidth) / 2
    const centerY = this.scale.height / 2

    visiblePlayers.forEach((player, index) => {
      const x = startX + index * (spriteWidth + spacing)

      player.maskKey ??= this.getRandomMask()

      const playerSprite = this.add.sprite(0, 0, 'player')
      playerSprite.setDisplaySize(spriteWidth, spriteHeight)
      playerSprite.setScale(2.0)

      const maskSprite = this.add.sprite(-5, 0, player.maskKey)
      maskSprite.setDisplaySize(spriteWidth, spriteHeight)
      maskSprite.setScale(2.0)

      const playerContainer = this.add.container(
        x + spriteWidth / 2,
        centerY + 30,
        [playerSprite, maskSprite]
      )

      playerContainer.setSize(spriteWidth, spriteHeight)
      playerContainer.setInteractive(
        new Phaser.Geom.Rectangle(
          -spriteWidth / 2,
          -spriteHeight / 2,
          spriteWidth,
          spriteHeight
        ),
        Phaser.Geom.Rectangle.Contains
      )
      playerContainer.on('pointerover', () => {
        if (!player.isActive || this.modalOpen) return
        playerContainer.setScale(1.05)
        this.sounds.sospechoso.play()
      })

      playerContainer.on('pointerout', () => {
        playerContainer.setScale(1)
      })

      playerContainer.on('pointerdown', () => {
        if (!player.isActive || this.modalOpen) return
        this.openConfirmModal(player)
      })

      this.playerContainers.set(player.name, playerContainer)
      this.maskSprites.set(player.name, maskSprite)
      
      this.add
        .text(playerContainer.x, playerContainer.y + spriteHeight / 2 + 80, player.name, {
          fontSize: '18px',
          color: '#ffffff'
        })
        .setOrigin(0.5, 0)
    })
    
    const fg = this.add.image(640, 360, 'foreground');
    fg.setScale(scale)
    this.showToast('Menciona una palabra relacionada para demostrar que conoces la contraseña sin que el impostor descubra cual es.')
  }

  showToast(message: string) {
    const { width } = this.scale

    const padding = 20
    const toastY = 80

    const text = this.add.text(0, 0, message, {
      fontSize: '18px',
      color: '#ffffff',
      align: 'center',
      wordWrap: { width: 500 }
    }).setOrigin(0.5)

    const bg = this.add.rectangle(
      0,
      0,
      text.width + padding * 2,
      text.height + padding * 2,
      0x020617,
      0.85
    )

    const toast = this.add.container(width / 2, toastY, [bg, text])
    toast.setAlpha(0)
    toast.setY(toastY - 20)

    this.tweens.add({
      targets: toast,
      alpha: 1,
      y: toastY,
      duration: 400,
      ease: 'Sine.easeOut'
    })
  }


  getRandomMask(): string {
    return Phaser.Utils.Array.GetRandom(MASKS).key
  }

  closeModal() {
    this.modalOpen = false
    this.modalContainer?.destroy()
    this.modalContainer = undefined
  }


  openConfirmModal(player: Player) {
    this.modalOpen = true

    const { width, height } = this.scale

    const overlay = this.add
      .rectangle(width / 2, height / 2, width, height, 0x000000, 0.6)
      .setInteractive()

    const panel = this.add
      .image(width / 2, height / 2, 'modal-panel')
      .setOrigin(0.5)

    const text = this.add
      .text(width / 2, height / 2 - 40, `¿Desenmascarar a ${player.name}?`, {
        fontSize: '30px',
        color: '#000000'
      })
      .setOrigin(0.5)

    const confirmBtn = this.add
      .image(width / 2 - 110, height / 2 + 50, 'btn-confirm')
      .setInteractive({ useHandCursor: true })

    confirmBtn.on('pointerover', () => {
      confirmBtn.setTexture('btn-confirm-hover')
    })

    confirmBtn.on('pointerout', () => {
      confirmBtn.setTexture('btn-confirm')
    })

    confirmBtn.on('pointerdown', () => {
      this.sounds.click.play()
      
      window.dispatchEvent(
        new CustomEvent('game:player-eliminated', {
          detail: player.name
        })
      )
      this.removePlayer(player.name)
      this.closeModal()
    })

    const cancelBtn = this.add
      .image(width / 2 + 110, height / 2 + 50, 'btn-cancel')
      .setInteractive({ useHandCursor: true })

    cancelBtn.on('pointerdown', () => {
      this.sounds.click.play()
      this.closeModal()
    })

    cancelBtn.on('pointerover', () => {
      cancelBtn.setTexture('btn-cancel-hover')
    })

    cancelBtn.on('pointerout', () => {
      cancelBtn.setTexture('btn-cancel')
    })

    this.modalContainer = this.add.container(0, 0, [
      overlay,
      panel,
      confirmBtn,
      cancelBtn,
      text,
    ])
  }

  getPlayer(name: string): Player | undefined {
    return this.players.find(p => p.name === name)
  }

  removePlayer(name: string) {
    const player = this.getPlayer(name)
    const container = this.playerContainers.get(name)
    const mask = this.maskSprites.get(name)

    if (!player || !container) return

    player.isActive = false

    this.tweens.add({
      targets: mask,
      angle: { from: -5, to: 5 },
      alpha: 0,
      y: mask!.y + 20,
      duration: 300,
      ease: 'Sine.easeInOut',
      onComplete: () => mask?.destroy(),
    })

    this.maskSprites.delete(name)

    container
      .setAlpha(0.6)
      .disableInteractive()
  }
}

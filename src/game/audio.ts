import clickUrl from '@/assets/Audio/Boton_1.mp3'
import menuUrl from '@/assets/Audio/Tema_Menu.mp3'
import victoryUrl from '@/assets/Audio/Stinger_Victoria.mp3'
import defeatUrl from '@/assets/Audio/Stinger_Derrota.mp3'

const clickAudio = new Audio(
  clickUrl
)
clickAudio.volume = 0.7

export function playClick() {
  clickAudio.currentTime = 0
  clickAudio.play()
}

const menuSong = new Audio(
  menuUrl
)

menuSong.loop = true
menuSong.volume = 0.5

export function playMenuSong() {
  if (menuSong.paused) {
    menuSong.currentTime = 0
    menuSong.play()
  }
}

export function stopMenuSong() {
  menuSong.pause()
  menuSong.currentTime = 0
}

export function playResult(result: 'victory' | 'defeat') {
  const stinger = new Audio(result === 'victory' ? victoryUrl : defeatUrl)
  stinger.volume = 0.7
  stinger.play().catch(() => {})
}

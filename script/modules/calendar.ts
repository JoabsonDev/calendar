const MONTH = [
  {
    abbrev: "Jan",
    fullName: "Janeiro"
  },
  {
    abbrev: "Fev",
    fullName: "Fevereiro"
  },
  {
    abbrev: "Mar",
    fullName: "Março"
  },
  {
    abbrev: "Abr",
    fullName: "Abril"
  },
  {
    abbrev: "Mai",
    fullName: "Maio"
  },
  {
    abbrev: "Jun",
    fullName: "Junho"
  },
  {
    abbrev: "Jul",
    fullName: "Julho"
  },
  {
    abbrev: "Ago",
    fullName: "Agosto"
  },
  {
    abbrev: "Set",
    fullName: "Setembro"
  },
  {
    abbrev: "Out",
    fullName: "Outubro"
  },
  {
    abbrev: "Nov",
    fullName: "Novembro"
  },
  {
    abbrev: "Dez",
    fullName: "Dezembro"
  }
] as const

const WEEKDAY = [
  {
    abbrev: "Dom",
    fullName: "Domingo"
  },
  {
    abbrev: "Seg",
    fullName: "Segunda-feira"
  },
  {
    abbrev: "Ter",
    fullName: "terça-feira"
  },
  {
    abbrev: "Qua",
    fullName: "quarta-feira"
  },
  {
    abbrev: "Qui",
    fullName: "Domingo"
  },
  {
    abbrev: "Sex",
    fullName: "Sexta-feira"
  },
  {
    abbrev: "Sáb",
    fullName: "Sábado"
  }
] as const

export class Calendar {
  private _date: Date
  private _MAXIMUN_NUMBER_OF_DAYS_IN_THE_YEAR = 367
  private _elementWrapper: HTMLElement
  private _month?: number

  constructor({
    currentDate = new Date(),
    elementWrapper = document.body
  }: {
    currentDate?: Date
    elementWrapper?: HTMLElement | string
  } = {}) {
    this._date = currentDate
    this._elementWrapper = (
      typeof elementWrapper === "string"
        ? document.querySelector(elementWrapper)
        : elementWrapper
    ) as HTMLElement

    this._actions()

    this._init()
  }

  private _actions() {
    document.addEventListener("click", (event) => {
      const target = event.target as HTMLElement

      switch (target.dataset.action) {
        case "previous":
          this.previous()
          break
        case "next":
          this.next()
          break
        case "show-dialog":
          this._showDialog()
          break
        case "close-dialog":
          this._closeDialog()
          break
        case "set-month":
          this._setMonth(target)
          break
        case "set-date":
          this._setDate()
          break
      }
    })
  }

  private _init() {
    const fullYear = this._getYearInMonths(this._getYearInDays())
    const previousMonth =
      fullYear[this._date.getMonth() - 1] ||
      this._getDecemberOfThePreviousYear()
    const currentMonth = fullYear[this._date.getMonth()]
    const nextMonth =
      fullYear[this._date.getMonth() + 1] ||
      this._getJanuaryOfTheFollowingYear()

    const firstCurrentDay = currentMonth[0].getDay()
    const lastCurrentDay = currentMonth[currentMonth.length - 1].getDay()

    const filteredPreviousMonth =
      -firstCurrentDay === 0 ? [] : previousMonth.slice(-firstCurrentDay)
    const filteredNextMonth = nextMonth.slice(0, 7 - (lastCurrentDay + 1))

    const calendar = [
      ...filteredPreviousMonth,
      ...currentMonth,
      ...filteredNextMonth
    ]

    const groupedByWeek = this._groupByWeek(calendar)
    this._buildCalendar(groupedByWeek)
    this._buildDialog()
  }

  private _getYearInDays(): Date[] {
    return Array.from({
      length: this._MAXIMUN_NUMBER_OF_DAYS_IN_THE_YEAR
    })
      .map((_, index) => new Date(this._date.getFullYear(), 0, index + 1))
      .filter((date) => date.getFullYear() === this._date.getFullYear())
  }

  private _getYearInMonths(fullYear: Date[]): Date[][] {
    return fullYear.reduce(
      (accumulator: Date[][], date) => {
        const month = date.getMonth()
        if (!accumulator[month]) accumulator[month] = []
        accumulator[month].push(date)
        return accumulator
      },
      Array.from({ length: 12 }, () => [])
    )
  }

  private _buildCalendar(calendar: Date[][]) {
    const calendarElements = `
      <div class="calendar__header">
        <button class="calendar__header__button" data-action="show-dialog">${
          MONTH[this._date.getMonth()].fullName
        } de ${this._date.getFullYear()}</button>

        <div class="calendar__header__controls">
          <button class="calendar__header__button calendar__header__button--up" data-action="previous">
            ⯅
          </button>
          <button class="calendar__header__button calendar__header__button--down" data-action="next">
            ⯆
          </button>
        </div>
      </div>

      <table class="table">
        <thead>
          <tr>
          ${Object.values(WEEKDAY)
            .map(
              ({ abbrev }) => `<th class="table__th">${abbrev.charAt(0)}</th>`
            )
            .join("\n")}
          </tr>
        </thead>

        <tbody>
            ${calendar
              .map(
                (week) => `
              <tr>
                ${week
                  .map(
                    (date) => `
                  <td class="table__td${
                    this._date.getMonth() === date.getMonth()
                      ? " table__td--current-month"
                      : ""
                  }${
                      new Date().getDate() === date.getDate() &&
                      new Date().getMonth() === date.getMonth()
                        ? " table__td--today"
                        : ""
                    }">
                    ${date.getDate()}
                  </td>
                `
                  )
                  .join("\n")}
              </tr>
            `
              )
              .join("\n")}
        </tbody>
      </table>
    `
    this._elementWrapper.innerHTML = calendarElements
  }

  private _buildDialog() {
    if (document.querySelector(".dialog")) return

    const dialog = document.createElement("dialog")
    dialog.classList.add("dialog")
    dialog.innerHTML = `
      <div class="dialog__header">
      <label class="dialog__header__label">
        <input
          autofocus
          id="input-year"
          class="dialog__header__input"
          type="number"
          aria-label="selecione o ano"
        />
        <span class="dialog__header__input-error">O ano não pode ser inferior a 100</span>
      </label>

        <button
          class="dialog__header__close"
          data-action="close-dialog"
          aria-label="fechar"
        >
          x
        </button>
      </div>

      <div class="dialog__body"></div>

      <div class="dialog__footer">
        <button data-action="close-dialog" class="dialog__footer__button dialog__footer__button--cancel">cancelar</button>
        <button class="dialog__footer__button dialog__footer__button--ok" data-action="set-date">ok</button>
      </div>    
    `
    document.body.appendChild(dialog)

    const inputYear = dialog.querySelector("#input-year") as HTMLInputElement

    inputYear.addEventListener("input", (event) => {
      const target = event.target as HTMLInputElement
      const value = Number(target.value)
      if (value < 100) {
        inputYear.parentElement!.classList.add("dialog__header__label--error")
      } else {
        inputYear.parentElement!.classList.remove(
          "dialog__header__label--error"
        )
      }
    })
  }

  private _groupByWeek(days: Date[]): Date[][] {
    return days.reduce((weeks: Date[][], day, index) => {
      const weekIndex = Math.floor(index / 7)
      if (!weeks[weekIndex]) {
        weeks[weekIndex] = []
      }
      weeks[weekIndex].push(day)
      return weeks
    }, [])
  }

  private _getDecemberOfThePreviousYear() {
    return Array.from({ length: 31 }).map(
      (_, index) => new Date(this._date.getFullYear() - 1, 11, index + 1)
    )
  }

  private _getJanuaryOfTheFollowingYear() {
    return Array.from({ length: 31 }).map(
      (_, index) => new Date(this._date.getFullYear() + 1, 0, index + 1)
    )
  }

  public next() {
    this._date.setMonth(this._date.getMonth() + 1)
    this._init()
  }

  public previous() {
    this._date.setMonth(this._date.getMonth() - 1)
    this._init()
  }

  private _showDialog() {
    const dialog = document.querySelector(".dialog") as HTMLDialogElement
    const inputYear = document.querySelector("#input-year") as HTMLInputElement
    const dialogBody = document.querySelector(".dialog__body") as HTMLElement

    dialogBody.innerHTML = Object.values(MONTH)
      .map(
        ({ abbrev }, index) =>
          `<button class="month${
            this._date.getMonth() === index ? " month-active" : ""
          }" data-action="set-month">${abbrev}</button>`
      )
      .join("\n")

    inputYear.value = this._date.getFullYear().toString()

    dialog.showModal()

    dialog.addEventListener("click", (event) => {
      const rect = dialog.getBoundingClientRect()

      if (
        event.clientX < rect.left ||
        event.clientX > rect.right ||
        event.clientY < rect.top ||
        event.clientY > rect.bottom
      )
        dialog.close()
    })
  }

  private _closeDialog() {
    const dialog = document.querySelector(".dialog") as HTMLDialogElement
    dialog.close()
  }

  private _setMonth(target: HTMLElement) {
    document.querySelectorAll(".month").forEach((element) => {
      element === target
        ? element.classList.add("month-active")
        : element.classList.remove("month-active")
    })
    this._month = Object.values(MONTH).findIndex(
      ({ abbrev }) => abbrev === target.innerText
    )
  }

  private _setDate() {
    const inputYear = document.querySelector("#input-year") as HTMLInputElement
    const value = Number(inputYear.value)

    if (value < 100) {
      inputYear.focus()
      return
    }

    this._date.setMonth(this._month!)
    this._date.setFullYear(value)
    this._init()
    this._closeDialog()
  }
}

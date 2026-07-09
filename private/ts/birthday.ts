
const element = document.querySelector("#birth") as HTMLElement

// yes, this is my birthday
// no, i don't know the exact time I was born on
// no, i wasn't born on april 2nd - it's february 4th
function calculateAge() {
    const [d, m, y] = "04/02/08".split("/").map(Number)
    const year = y! < 100 ? 2000 + y! : y
    
    const dob = new Date(year!, m! - 1, d)
    const ms = 365.2425 * 24 * 60 * 60 * 1000

    return ((Date.now() - dob.getTime()) / ms).toFixed(8)
}

setInterval(() => {
    element.textContent = calculateAge() 
}, 300)


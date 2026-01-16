class MyHeader extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `

    <header class="appHeader">
        
        <h1 class="title"><img class="weatherIcon" src="media/images/logoRemaster.png" alt="weather logo"></h1>
	
        <input id="getCity" type="text" placeholder="Busca ciudad aquí" />
    </header>
    `;
    }
}
customElements.define("header-plus-weather", MyHeader);
'use strict';

customElements.define('compodoc-menu', class extends HTMLElement {
    constructor() {
        super();
        this.isNormalMode = this.getAttribute('mode') === 'normal';
    }

    connectedCallback() {
        this.render(this.isNormalMode);
    }

    render(isNormalMode) {
        let tp = lithtml.html(`
        <nav>
            <ul class="list">
                <li class="title">
                    <a href="index.html" data-type="index-link">central-system documentation</a>
                </li>

                <li class="divider"></li>
                ${ isNormalMode ? `<div id="book-search-input" role="search"><input type="text" placeholder="Type to search"></div>` : '' }
                <li class="chapter">
                    <a data-type="chapter-link" href="index.html"><span class="icon ion-ios-home"></span>Getting started</a>
                    <ul class="links">
                        <li class="link">
                            <a href="overview.html" data-type="chapter-link">
                                <span class="icon ion-ios-keypad"></span>Overview
                            </a>
                        </li>
                        <li class="link">
                            <a href="index.html" data-type="chapter-link">
                                <span class="icon ion-ios-paper"></span>README
                            </a>
                        </li>
                                <li class="link">
                                    <a href="dependencies.html" data-type="chapter-link">
                                        <span class="icon ion-ios-list"></span>Dependencies
                                    </a>
                                </li>
                                <li class="link">
                                    <a href="properties.html" data-type="chapter-link">
                                        <span class="icon ion-ios-apps"></span>Properties
                                    </a>
                                </li>
                    </ul>
                </li>
                    <li class="chapter modules">
                        <a data-type="chapter-link" href="modules.html">
                            <div class="menu-toggler linked" data-bs-toggle="collapse" ${ isNormalMode ?
                                'data-bs-target="#modules-links"' : 'data-bs-target="#xs-modules-links"' }>
                                <span class="icon ion-ios-archive"></span>
                                <span class="link-name">Modules</span>
                                <span class="icon ion-ios-arrow-down"></span>
                            </div>
                        </a>
                        <ul class="links collapse " ${ isNormalMode ? 'id="modules-links"' : 'id="xs-modules-links"' }>
                            <li class="link">
                                <a href="modules/AppModule.html" data-type="entity-link" >AppModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                            'data-bs-target="#controllers-links-module-AppModule-5c4c32ec4ef5f3bb1ad0ad2ec7e45b74e3310a20e808e496bf60c7d81453c0a405cff83ff25f807764bf627ba5ffb7fec1ea3b2ec42f72f3d5094383c9172715"' : 'data-bs-target="#xs-controllers-links-module-AppModule-5c4c32ec4ef5f3bb1ad0ad2ec7e45b74e3310a20e808e496bf60c7d81453c0a405cff83ff25f807764bf627ba5ffb7fec1ea3b2ec42f72f3d5094383c9172715"' }>
                                            <span class="icon ion-md-swap"></span>
                                            <span>Controllers</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="controllers-links-module-AppModule-5c4c32ec4ef5f3bb1ad0ad2ec7e45b74e3310a20e808e496bf60c7d81453c0a405cff83ff25f807764bf627ba5ffb7fec1ea3b2ec42f72f3d5094383c9172715"' :
                                            'id="xs-controllers-links-module-AppModule-5c4c32ec4ef5f3bb1ad0ad2ec7e45b74e3310a20e808e496bf60c7d81453c0a405cff83ff25f807764bf627ba5ffb7fec1ea3b2ec42f72f3d5094383c9172715"' }>
                                            <li class="link">
                                                <a href="controllers/AppController.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >AppController</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-AppModule-5c4c32ec4ef5f3bb1ad0ad2ec7e45b74e3310a20e808e496bf60c7d81453c0a405cff83ff25f807764bf627ba5ffb7fec1ea3b2ec42f72f3d5094383c9172715"' : 'data-bs-target="#xs-injectables-links-module-AppModule-5c4c32ec4ef5f3bb1ad0ad2ec7e45b74e3310a20e808e496bf60c7d81453c0a405cff83ff25f807764bf627ba5ffb7fec1ea3b2ec42f72f3d5094383c9172715"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-AppModule-5c4c32ec4ef5f3bb1ad0ad2ec7e45b74e3310a20e808e496bf60c7d81453c0a405cff83ff25f807764bf627ba5ffb7fec1ea3b2ec42f72f3d5094383c9172715"' :
                                        'id="xs-injectables-links-module-AppModule-5c4c32ec4ef5f3bb1ad0ad2ec7e45b74e3310a20e808e496bf60c7d81453c0a405cff83ff25f807764bf627ba5ffb7fec1ea3b2ec42f72f3d5094383c9172715"' }>
                                        <li class="link">
                                            <a href="injectables/AppService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >AppService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/OcppModule.html" data-type="entity-link" >OcppModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                            'data-bs-target="#controllers-links-module-OcppModule-42e21dbfb781f5190f08dbba2b5fc1a4de4f15f332d14b17b71e494abc84c4bcd43e7e252d6eb6113dea6bce8848429c07ba0dceb8434f36adfcfb4e40724c85"' : 'data-bs-target="#xs-controllers-links-module-OcppModule-42e21dbfb781f5190f08dbba2b5fc1a4de4f15f332d14b17b71e494abc84c4bcd43e7e252d6eb6113dea6bce8848429c07ba0dceb8434f36adfcfb4e40724c85"' }>
                                            <span class="icon ion-md-swap"></span>
                                            <span>Controllers</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="controllers-links-module-OcppModule-42e21dbfb781f5190f08dbba2b5fc1a4de4f15f332d14b17b71e494abc84c4bcd43e7e252d6eb6113dea6bce8848429c07ba0dceb8434f36adfcfb4e40724c85"' :
                                            'id="xs-controllers-links-module-OcppModule-42e21dbfb781f5190f08dbba2b5fc1a4de4f15f332d14b17b71e494abc84c4bcd43e7e252d6eb6113dea6bce8848429c07ba0dceb8434f36adfcfb4e40724c85"' }>
                                            <li class="link">
                                                <a href="controllers/OcppController.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >OcppController</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-OcppModule-42e21dbfb781f5190f08dbba2b5fc1a4de4f15f332d14b17b71e494abc84c4bcd43e7e252d6eb6113dea6bce8848429c07ba0dceb8434f36adfcfb4e40724c85"' : 'data-bs-target="#xs-injectables-links-module-OcppModule-42e21dbfb781f5190f08dbba2b5fc1a4de4f15f332d14b17b71e494abc84c4bcd43e7e252d6eb6113dea6bce8848429c07ba0dceb8434f36adfcfb4e40724c85"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-OcppModule-42e21dbfb781f5190f08dbba2b5fc1a4de4f15f332d14b17b71e494abc84c4bcd43e7e252d6eb6113dea6bce8848429c07ba0dceb8434f36adfcfb4e40724c85"' :
                                        'id="xs-injectables-links-module-OcppModule-42e21dbfb781f5190f08dbba2b5fc1a4de4f15f332d14b17b71e494abc84c4bcd43e7e252d6eb6113dea6bce8848429c07ba0dceb8434f36adfcfb4e40724c85"' }>
                                        <li class="link">
                                            <a href="injectables/OcppService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >OcppService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                </ul>
                </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#miscellaneous-links"'
                            : 'data-bs-target="#xs-miscellaneous-links"' }>
                            <span class="icon ion-ios-cube"></span>
                            <span>Miscellaneous</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? 'id="miscellaneous-links"' : 'id="xs-miscellaneous-links"' }>
                            <li class="link">
                                <a href="miscellaneous/functions.html" data-type="entity-link">Functions</a>
                            </li>
                        </ul>
                    </li>
                    <li class="chapter">
                        <a data-type="chapter-link" href="coverage.html"><span class="icon ion-ios-stats"></span>Documentation coverage</a>
                    </li>
                    <li class="divider"></li>
                    <li class="copyright">
                        Documentation generated using <a href="https://compodoc.app/" target="_blank" rel="noopener noreferrer">
                            <img data-src="images/compodoc-vectorise.png" class="img-responsive" data-type="compodoc-logo">
                        </a>
                    </li>
            </ul>
        </nav>
        `);
        this.innerHTML = tp.strings;
    }
});
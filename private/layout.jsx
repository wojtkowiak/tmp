var ThemeManager = new MUI.Styles.ThemeManager();
var IntlMixin = ReactIntl.IntlMixin;
injectTapEventPlugin();

var { AppBar, RaisedButton } = MUI;

ThemeMixin = {
    childContextTypes: {
        muiTheme: React.PropTypes.object
    },

    getChildContext: function () {
        return {
            muiTheme: ThemeManager.getCurrentTheme()
        };
    }
}

language = {
    "locales": ["en-US"],
    "messages": {
        "logIn": "Log in"
    }
};

MainLayout = React.createClass({
    mixins: [ThemeMixin],
    render() {
        return (
            <div>
                <AppBar title="Viedome POC"/>
                <main>{this.props.content}</main>
                <footer></footer>
            </div>
        );
    },
});

LoginPage = React.createClass({
    mixins: [
        ThemeMixin,
        ReactMeteorData,
        IntlMixin
    ],
    getMeteorData() {

    },
    render() {
        return <div><br/></div>;
    }
});

let Logo = React.createClass({
    render: function() {
        return (
            <SvgIcon {...this.props}>

                <g
                    transform="translate(-142.66415,-395.06189)"
                    style="display:inline"
                    id="layer1" />
                <g
                    transform="translate(-142.66415,-395.06189)"
                    style="display:inline"
                    id="layer2">
                    <path
                        id="path3857-8"
                        d="m 173.69721,402.06882 0,12 7,0 0,-19 -30,0 c 0,0 -8,0 -8,8 0,8 0,55 0,55 0,0 -1,8 8,8 9,0 30,0 30,0 l 0,-19 -7,0 0,12 -22,0 c 0,0 -2,0 -2,-2 0,-2 0,-2 0,-2 l 0,-51 c 0,0 0,-2 2,-2 2,0 22,0 22,0 z"
                        style="fill:#ffffff;fill-opacity:1;stroke:none" />
                    <path
                        id="path3877-4"
                        d="m 187.66415,395.06882 0,7 5,0 0,57 -5,0 0,7 17,0 0,-7 -5,0 0,-26 23,0 c 8,0 8,-8 8,-8 l 0,-22 c 0,-8 -8,-8 -8,-8 l -35,0 z m 12,7 22,0 c 0,0 2,0 2,2 l 0,20 c 0,0 0,2 -2,2 l -22,0 0,-24 z"
                        style="fill:#ffffff;fill-opacity:1;stroke:none" />
                    <path
                        id="path3857-1-5"
                        d="m 268.69721,402.06882 0,12 7,0 0,-19 -30,0 c 0,0 -8,0 -8,8 0,8 0,55 0,55 0,0 -1,8 8,8 9,0 30,0 30,0 l 0,-19 -7,0 0,12 -22,0 c 0,0 -2,0 -2,-2 0,-2 0,-2 0,-2 l 0,-51 c 0,0 0,-2 2,-2 2,0 22,0 22,0 z"
                        style="fill:#ffffff;fill-opacity:1;stroke:none" />
                    <g
                        id="g3957-1"
                        transform="translate(116.66415,310.06882)">
                        <path
                            id="path3903-7"
                            d="m 207,85 -27,47 0,7 29,0 0,17 7,0 0,-17 8,0 0,-7 -8,0 0,-47 -9,0 z m 2,10 0,37 -21,0 21,-37 z"
                            style="fill:#ffffff;fill-opacity:1;stroke:none" />
                    </g>
                    <path
                        id="path3909-1"
                        d="m 355.3204,395.06882 c -1.53125,0.10938 -7.65625,1 -7.65625,8 l 0,8 0,47 c 0,0 0,8 8,8 l 22,0 c 0,0 8,0 8,-8 l 0,-23 c 0,0 1,-8 -8,-8 l -23,0 0,-23 c 0,0 0,-2 2,-2 l 20,0 c 0,0 2,0 2,2 l 0,11 7,0 0,-12 c 0,0 1,-8 -8,-8 l -9,0 -13,0 c 0,0 -0.125,-0.0156 -0.34375,0 z m -0.65625,39 22,0 c 0,0 2,0 2,2 l 0,21 c 0,0 0,2 -2,2 l -20,0 c 0,0 -2,0 -2,-2 l 0,-23 z"
                        style="fill:#ffffff;fill-opacity:1;stroke:none" />
                    <g
                        id="g3957-9-2"
                        transform="translate(212.66415,310.06882)">
                        <path
                            id="path3903-4-7"
                            transform="translate(-96,0)"
                            d="m 303,85 -27,47 0,7 29,0 0,17 7,0 0,-17 8,0 0,-7 -8,0 0,-47 -9,0 z m 2,10 0,37 -21,0 21,-37 z"
                            style="fill:#ffffff;fill-opacity:1;stroke:none" />
                    </g>
                </g>
            </SvgIcon>
        );
    }
});
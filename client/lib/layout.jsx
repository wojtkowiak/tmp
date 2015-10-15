var {
    AppCanvas,
        AppBar,
        Styles,
        RaisedButton,
        DatePicker,
    SvgIcon
} = MUI;
var { ThemeManager, LightRawTheme } = Styles;
injectTapEventPlugin();

ThemeMixin = {
    childContextTypes: {
        muiTheme: React.PropTypes.object
    },

    getChildContext() {
        return {
            muiTheme: ThemeManager.getMuiTheme(LightRawTheme)
        };
    }
}


MainLayout = React.createClass({
    mixins: [ThemeMixin],


    render() {
        return (
            <AppCanvas>
                <AppBar title="&nbsp;CDT Player" iconElementLeft={<img src="logo.svg" height="48"/>}/>
                {this.props.content}

            </AppCanvas>
        );
    },
});
//<AppBar title="Viedome POC"/>

LoginPage = React.createClass({
    /*mixins: [
        ThemeMixin,
        ReactMeteorData,
        IntlMixin
    ],
    getMeteorData() {

    },*/
    render() {
        return <div><br/></div>;
    }
});

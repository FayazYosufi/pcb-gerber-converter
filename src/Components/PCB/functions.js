const layerStyle = {
    'top_copper': {color: 'crimson', opacity: 0.3},
    'bottom_copper': {color: '#008208', opacity: 0.3},
    'all_outline': {color: 'green', opacity: 0.5},
    'top_silkscreen': {color: 'red', opacity: 0.5},
    'bottom_silkscreen': {color: 'blue', opacity: 0.5},
    'bottom_soldermask': {color: '#757500', opacity: 0.5, display: 'none'},
    'bottom_solderpaste': {color: 'orange', opacity: 0.5},
    'top_solderpaste': {color: '#c362c3', opacity: 0.5},
    'top_soldermask': {color: '#af4e5f', opacity: 0.5, display: 'none'},
};

const layerstyle = layerStyle[ids[index]] || { color: 'green', opacity: 0.5 };
gElement.setAttribute('style', `color: ${layerstyle.color}; opacity: ${layerstyle.opacity}; display: ${ layerstyle.display ? layerstyle.display : 'block' }`);

export function handleColorChange(props) {
    const svgColor = {
        'bw': `
            ${props.id}_fr4 {color: #000000  !important;}
            .${props.id}_cu {color: #ffffff !important;}
            .${props.id}_cf {color: #ffffff !important;}
            .${props.id}_sm {color: #ffffff; opacity: 0 !important;}
            .${props.id}_ss {color: #ffffff !important;}
            .${props.id}_sp {color: #ffffff !important;}
            .${props.id}_out {color: #000000 !important;}
        `,

        'bwInvert': `
            .${props.id}_fr4 {color: #ffffff  !important;}
            .${props.id}_cu {color: #000000 !important;}
            .${props.id}_cf {color: #000000 !important;}
            .${props.id}_sm {color: #ffffff; opacity: 0 !important;}
            .${props.id}_ss {color: #000000 !important;}
            .${props.id}_sp {color: #000000 !important;}
            .${props.id}_out {color: #ffffff !important;}
        `,

        'original': `
            .${props.id}_fr4 {color: #666666  !important;}
            .${props.id}_cu {color: #cccccc !important;}
            .${props.id}_cf {color: #cc9933 !important;}
            .${props.id}_sm {color: #004200 !important; opacity: 0.75 !important;}
            .${props.id}_ss {color: #ffffff !important;}
            .${props.id}_sp {color: #999999 !important;}
            .${props.id}_out {color: #000000 !important;}
        `
    }

    console.log(props)
    props.svgs.forEach(svg => {
        const stackStyle = svg.querySelector('style');
        stackStyle.innerHTML = svgColor[props.color];
    })

    // const bottomstackStyle = props.bottomstack.svg.querySelector('style');
    // bottomstackStyle.innerHTML = svgColor[props.color];

}
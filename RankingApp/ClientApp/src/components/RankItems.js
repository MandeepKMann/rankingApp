﻿import React, { useState, useEffect } from 'react';
import RankingGrid from './RankingGrid.js';
import ItemCollection from './ItemCollection.js';
import { Container } from 'reactstrap';
import Swal from 'sweetalert2'
import LoadingIcon from './LoadingIcon.js';

const RankItems = ({items, setItems, dataType, imgArr, localStorageKey}) => {

    const [reset, setReset] = useState(false);
    const [resetLoading, setResetLoading] = useState(false);

    const Reset = () => {
        setReset(true);
        setResetLoading(true);
    }

    //stores the id value of the item that is being dragged
    const drag = (ev) => {
        ev.dataTransfer.setData("text", ev.target.id);
    }

    //prevent default event
    const allowDrop = (ev) => {
        ev.preventDefault();
    }

    const drop = (ev) => {
        ev.preventDefault();
        //targetElm is the element in the ranking grid which the user chooses to drop the item
        const targetElm = ev.target;
        if (targetElm.nodeName === "IMG") {
            //if an image element already exists as a child element where the user it attempting to drop the image, it will return false
            return false;
        }
        //allows the drop function to only execute if the target element does not have any child elements
        if (targetElm.childNodes.length === 0) {
            let data = parseInt(ev.dataTransfer.getData("text").substring(5));
            //changes the ranking item of the selected item
            const transformedCollection = items.map((item) => (item.id === parseInt(data)) ?
                { ...item, ranking: parseInt(targetElm.id.substring(5)) }
                : { ...item, ranking: item.ranking });
            //sets the state of the items array and rerenders the component
            setItems(transformedCollection);
        }
    }

    //API call
    const getDataFromApi = () => {
        fetch(`item/${dataType}`)
            .then((res) => {
                return res.json();
            })
            .then(data => {
                setItems(data);
            })
    }

    //ONLY call the API if the items collection is null
    useEffect(() => {
        if (items == null) {
            getDataFromApi();
        }
    }, [dataType])

    //Save the state of the of the relevent collection to local storage every time the relevent item's state changes
    useEffect(() => {
        if (items != null) {
            localStorage.setItem(localStorageKey, JSON.stringify(items));
        }
        //set rreset to false when the state of the item's collection changes
        setReset(false);
        setResetLoading(false);
    }, [items])

    //If user clicks reseet button, a call is made to the API and refreshes the rankings of the items
    useEffect(() => {
        if (reset === true) {
            getDataFromApi();
        }
    }, [reset])

    const InstructionsAlert = () => {

        Swal.fire({
            title: 'Instructions',
            html: '1) Select either the Famous or Local Raccoons <br /> 2) Drag and drop the images of the Raccoons into the tiered rows <br /> 3) Each tier can only accept 4 images <br /> 4) Rankings can only be undone by resetting everything by clicking the Reset button'
        })
    }

    return (

        (items != null) ?
            <section className="raccoonSection">
                <Container className="flexContainerRank">
                    <RankingGrid
                        items={items}
                        imgArr={imgArr}
                        drag={drag}
                        allowDrop={allowDrop}
                        drop={drop}
                    />
                    <div className="buttons">
                        <button onClick={InstructionsAlert}>Instructions</button>
                        <button onClick={Reset} className="reset">Reset</button>
                    </div>
                    {resetLoading ? <LoadingIcon /> :
                    <ItemCollection
                        items={items}
                        imgArr={imgArr}
                        drag={drag}
                    />
                }
                </Container>
            </section>
            : <section>
                <Container className="flexContainerRank">
                    <LoadingIcon />
                </Container>
              </section>
        )
}

export default RankItems;
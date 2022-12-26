import { HyperspaceClient } from "hyperspace-client-js";

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// TOKEN
const HYPERSPACE_API_TOKEN = ''

// Connection to HS client
const client = new HyperspaceClient(HYPERSPACE_API_TOKEN);

//Points for each FRAKT
const points = {
    'Net-White': 10, 'Net-Orange': 13, 'Net-Red': 20, 'Net-Magenta': 40,
    'Portal-White': 15, 'Portal-Orange': 20, 'Portal-Red': 29, 'Portal-Magenta': 59,
    'Star-White': 22, 'Star-Orange': 29, 'Star-Red': 44, 'Star-Magenta': 88,
    'Eye-White': 88, 'Eye-Orange': 117, 'Eye-Red': 176, 'Eye-Magenta': 352,
    'Wave-White': 440, 'Wave-Orange': 578, 'Wave-Red': 880, 'Wave-Rainbow': 1760,
    '5-4': 10, '5-3': 13, '5-2': 20, '5-1': 40,
    '4-4': 15, '4-3': 20, '4-2': 29, '4-1': 59,
    '3-4': 22, '3-3': 29, '3-2': 44, '3-1': 88,
    '2-4': 88, '2-3': 117, '2-2': 176, '2-1': 352,
    '1-4': 440, '1-3': 578, '1-2': 880, '1-Rainbow': 1760,
};

// Create gql query for listing
function createQuery(projectName, page_number){
    let query = {
        condition: {
            projects: {project_id:projectName}
        },
        orderBy: {
            field_name: "lowest_listing_price",
            sort_order: "ASC"
        }, 
        paginationInfo: {
            page_number: page_number,
            page_size: 30
        }
    };

    return query;
};

//Calculation of Price Per Point
function getPricePerPoint(price, shape, color){

    const pricePerPoint = Number((price/points[`${shape}-${color}`]).toFixed(4));

    return pricePerPoint;

};

export async function main(pointsN){
    const collectionId = 'frakt';
    let hasNextPage = true;
    let pageNumber = 1;
    let list = [];
    let moreItems = true;

    //Get all listing
    while(hasNextPage){
        if(!moreItems){
            break
        };
        const nfts = await client.getMarketplaceSnapshot(createQuery(collectionId, pageNumber));
        for(const nft of nfts.getMarketPlaceSnapshots.market_place_snapshots){
            if(nft.lowest_listing_mpa===null){
                moreItems = false;
                break;
            };
            const data = {
                tokenAddress : nft.token_address,
                name: nft.name,
                price: nft.lowest_listing_mpa.price,
                shape: nft.attributes.shape,
                color: nft.attributes.color,
                points: points[`${nft.attributes.shape}-${nft.attributes.color}`],
                solPerPoints: getPricePerPoint(nft.lowest_listing_mpa.price, nft.attributes.shape, nft.attributes.color)
            };
            list.push(data);
        };
        pageNumber++;
        hasNextPage = nfts.getMarketPlaceSnapshots.pagination_info.has_next_page;
        await sleep(500);
    }

    //Sort list by pricePerPoints
    list.sort((a, b)=>{
        return a.solPerPoints - b.solPerPoints;
    });

    //Filter for getting final list given points needed
    let pointsCount = 0;
    let spending = 0;
    let whatToBuy = [];
    const pointsNeeded = Number(pointsN);
    for(const frakt of list){
        if(pointsCount>=pointsNeeded){
            break;
        };
        pointsCount+=frakt.points;
        spending+=frakt.price;
        if(pointsCount>pointsNeeded*1.05){
            pointsCount=pointsCount-frakt.points
        }else{
            whatToBuy.push(frakt);
        }
        
    };

    return whatToBuy
}


const supabase = require('../config/supabase');

async function getImagesByJerseyIds(jerseyIds) {
  if (!Array.isArray(jerseyIds) || jerseyIds.length === 0) {
    return {};
  }

  const { data, error } = await supabase
    .from('jersey_images')
    .select('jersey_id, url, public_id, position')
    .in('jersey_id', jerseyIds)
    .order('position', { ascending: true });

  if (error) {
    throw error;
  }

  return (data || []).reduce((accumulator, image) => {
    if (!accumulator[image.jersey_id]) {
      accumulator[image.jersey_id] = [];
    }

    accumulator[image.jersey_id].push(image);
    return accumulator;
  }, {});
}

function attachImages(jersey, imagesByJerseyId) {
  if (!jersey) {
    return null;
  }

  const jerseyImages = imagesByJerseyId?.[jersey.id] || [];

  return {
    ...jersey,
    images: jerseyImages,
    jersey_images: jerseyImages
  };
}

async function attachImagesToItems(items) {
  const jerseyIds = (items || []).map((item) => item.id);
  const imagesByJerseyId = await getImagesByJerseyIds(jerseyIds);

  return (items || []).map((item) => attachImages(item, imagesByJerseyId));
}

async function list({ filters, sortBy, sortOrder, page, limit }) {
  let query = supabase.from('jerseys').select('*', { count: 'exact' });

  if (filters.search) {
    const search = filters.search.replace(/,/g, ' ');
    query = query.or(
      `name.ilike.%${search}%,team_name.ilike.%${search}%,league_name.ilike.%${search}%,description.ilike.%${search}%`
    );
  }

  if (filters.team) {
    query = query.ilike('team_name', `%${filters.team}%`);
  }

  if (filters.priceMin !== undefined) {
    query = query.gte('price', filters.priceMin);
  }

  if (filters.priceMax !== undefined) {
    query = query.lte('price', filters.priceMax);
  }

  if (filters.nationalTeam !== undefined) {
    query = query.eq('is_national_team', filters.nationalTeam);
  }

  if (filters.hasShorts !== undefined) {
    query = query.eq('has_shorts', filters.hasShorts);
  }

  if (filters.sleeveType) {
    query = query.eq('sleeve_type', filters.sleeveType);
  }

  if (filters.versionType) {
    query = query.eq('version_type', filters.versionType);
  }

  if (filters.featuredClub) {
    query = query.eq('featured_club', filters.featuredClub);
  }

  if (filters.categoryType) {
    query = query.eq('category_type', filters.categoryType);
  }

  if (filters.isOnSale !== undefined) {
    query = query.eq('is_on_sale', filters.isOnSale);
  }

  query = query.order(sortBy, { ascending: sortOrder === 'asc' });

  const offset = (page - 1) * limit;
  const { data, error, count } = await query.range(offset, offset + limit - 1);

  if (error) {
    throw error;
  }

  const items = await attachImagesToItems(data || []);

  return {
    items,
    pagination: {
      page,
      limit,
      total: count || 0,
      total_pages: Math.ceil((count || 0) / limit)
    }
  };
}

async function findBySlug(slug) {
  const { data, error } = await supabase.from('jerseys').select('*').eq('slug', slug).single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }

    throw error;
  }

  const imagesByJerseyId = await getImagesByJerseyIds([data.id]);
  return attachImages(data, imagesByJerseyId);
}

async function findById(id) {
  const { data, error } = await supabase.from('jerseys').select('*').eq('id', id).single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }

    throw error;
  }

  const imagesByJerseyId = await getImagesByJerseyIds([data.id]);
  return attachImages(data, imagesByJerseyId);
}

async function create(payload) {
  const { data, error } = await supabase.from('jerseys').insert(payload).select('*').single();

  if (error) {
    throw error;
  }

  return data;
}

async function update(id, payload) {
  const { data, error } = await supabase.from('jerseys').update(payload).eq('id', id).select('*').single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }

    throw error;
  }

  return data;
}

async function remove(id) {
  const { data, error } = await supabase.from('jerseys').delete().eq('id', id).select('*').single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }

    throw error;
  }

  return data;
}

async function replaceImages(jerseyId, images) {
  const deleteError = await supabase.from('jersey_images').delete().eq('jersey_id', jerseyId);

  if (deleteError.error) {
    throw deleteError.error;
  }

  if (!Array.isArray(images) || images.length === 0) {
    return [];
  }

  const rows = images.map((image, position) => ({
    jersey_id: jerseyId,
    url: image.url,
    public_id: image.publicId,
    position
  }));

  const { data, error } = await supabase.from('jersey_images').insert(rows).select('*').order('position', { ascending: true });

  if (error) {
    throw error;
  }

  return data || [];
}

async function deleteImagesByJerseyId(jerseyId) {
  const { data, error } = await supabase.from('jersey_images').delete().eq('jersey_id', jerseyId).select('*');

  if (error) {
    throw error;
  }

  return data || [];
}

module.exports = {
  list,
  findBySlug,
  findById,
  create,
  update,
  remove,
  replaceImages,
  deleteImagesByJerseyId
};